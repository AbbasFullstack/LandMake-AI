import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { COOKIE_NAME } from "@shared/const";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  createLandingProject,
  createLandingVersion,
  deleteLandingProject,
  getLandingProject,
  listLandingProjects,
  listLandingVersions,
  listRecentProjectActivities,
  recordProjectActivity,
  updateLandingProject,
} from "./db";
import { generateLanding } from "./landmake";

const promptInput = z.string().trim().min(3, "Describe the landing page you want.").max(2400);

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  dashboard: router({
    overview: protectedProcedure.query(async ({ ctx }) => {
      const [projects, activities] = await Promise.all([
        listLandingProjects(ctx.user.id),
        listRecentProjectActivities(ctx.user.id),
      ]);
      return { projects, activities };
    }),
  }),
  projects: router({
    list: protectedProcedure.query(({ ctx }) => listLandingProjects(ctx.user.id)),
    create: protectedProcedure
      .input(z.object({ name: z.string().trim().min(1).max(120), prompt: promptInput }))
      .mutation(async ({ ctx, input }) => {
        const generated = generateLanding(input.prompt);
        const project = await createLandingProject(ctx.user.id, input.name, input.prompt, generated.html);
        await createLandingVersion({ projectId: project.id, prompt: input.prompt, configJson: JSON.stringify(generated), html: generated.html });
        await recordProjectActivity({ projectId: project.id, actorId: ctx.user.id, type: "project_created", message: "Landing project created from a deterministic prompt." });
        return { project, generated };
      }),
    get: protectedProcedure.input(z.object({ projectId: z.number().int().positive() })).query(async ({ ctx, input }) => {
      const project = await getLandingProject(ctx.user.id, input.projectId);
      if (!project) throw new Error("Landing project not found.");
      return { project, versions: await listLandingVersions(ctx.user.id, project.id) };
    }),
    generate: protectedProcedure
      .input(z.object({ projectId: z.number().int().positive(), prompt: promptInput }))
      .mutation(async ({ ctx, input }) => {
        const project = await getLandingProject(ctx.user.id, input.projectId);
        if (!project) throw new Error("Landing project not found.");
        const generated = generateLanding(input.prompt);
        await updateLandingProject(ctx.user.id, project.id, { prompt: input.prompt, currentHtml: generated.html });
        const version = await createLandingVersion({ projectId: project.id, prompt: input.prompt, configJson: JSON.stringify(generated), html: generated.html });
        await recordProjectActivity({ projectId: project.id, actorId: ctx.user.id, type: "generated", message: "A new landing-page version was generated." });
        return { generated, version };
      }),
    rename: protectedProcedure
      .input(z.object({ projectId: z.number().int().positive(), name: z.string().trim().min(1).max(120) }))
      .mutation(async ({ ctx, input }) => {
        const project = await getLandingProject(ctx.user.id, input.projectId);
        if (!project) throw new Error("Landing project not found.");
        const updated = await updateLandingProject(ctx.user.id, project.id, { name: input.name });
        return { project: updated };
      }),
    delete: protectedProcedure.input(z.object({ projectId: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
      const project = await getLandingProject(ctx.user.id, input.projectId);
      if (!project) throw new Error("Landing project not found.");
      await deleteLandingProject(ctx.user.id, project.id);
      return { success: true } as const;
    }),
    download: protectedProcedure.input(z.object({ projectId: z.number().int().positive() })).query(async ({ ctx, input }) => {
      const project = await getLandingProject(ctx.user.id, input.projectId);
      if (!project) throw new Error("Landing project not found.");
      return { fileName: `${project.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "landmake-page"}.html`, content: project.currentHtml };
    }),
  }),
});

export type AppRouter = typeof appRouter;
