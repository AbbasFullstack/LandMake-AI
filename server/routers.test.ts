import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const dbMocks = vi.hoisted(() => ({
  createLandingProject: vi.fn(),
  createLandingVersion: vi.fn(),
  deleteLandingProject: vi.fn(),
  getLandingProject: vi.fn(),
  listLandingProjects: vi.fn(),
  listLandingVersions: vi.fn(),
  listRecentProjectActivities: vi.fn(),
  recordProjectActivity: vi.fn(),
  updateLandingProject: vi.fn(),
}));

vi.mock("./db", () => dbMocks);

import { appRouter } from "./routers";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;
function createContext(user: AuthenticatedUser | null): TrpcContext {
  return { user, req: { protocol: "https", headers: {} } as TrpcContext["req"], res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"] };
}
const user: AuthenticatedUser = { id: 8, openId: "owner-8", name: "Owner", email: "owner@example.com", loginMethod: "manus", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() };

describe("LandMake protected procedures", () => {
  beforeEach(() => { vi.clearAllMocks(); dbMocks.createLandingProject.mockResolvedValue({ id: 21, ownerId: user.id, name: "Demo", prompt: "Build a SaaS page", currentHtml: "<html></html>" }); dbMocks.createLandingVersion.mockResolvedValue({ id: 31, projectId: 21, prompt: "Build a SaaS page", configJson: "{}", html: "<html></html>", createdAt: new Date() }); });

  it("rejects an anonymous request before attempting to list projects", async () => {
    const caller = appRouter.createCaller(createContext(null));
    await expect(caller.projects.list()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    expect(dbMocks.listLandingProjects).not.toHaveBeenCalled();
  });

  it("does not expose a project that is not owned by the signed-in user", async () => {
    dbMocks.getLandingProject.mockResolvedValue(undefined);
    const caller = appRouter.createCaller(createContext(user));
    await expect(caller.projects.get({ projectId: 42 })).rejects.toThrow("Landing project not found.");
    expect(dbMocks.getLandingProject).toHaveBeenCalledWith(user.id, 42);
    expect(dbMocks.listLandingVersions).not.toHaveBeenCalled();
  });

  it("generates a deterministic version and records the activity for an owned project", async () => {
    dbMocks.getLandingProject.mockResolvedValue({ id: 21, ownerId: user.id, name: "Demo", prompt: "Old prompt", currentHtml: "old" });
    dbMocks.updateLandingProject.mockResolvedValue({ id: 21 });
    const caller = appRouter.createCaller(createContext(user));
    const result = await caller.projects.generate({ projectId: 21, prompt: "Build a dark blue SaaS page with pricing" });
    expect(result.generated.html).toContain("<!doctype html>");
    expect(dbMocks.updateLandingProject).toHaveBeenCalledWith(user.id, 21, expect.objectContaining({ currentHtml: expect.any(String) }));
    expect(dbMocks.createLandingVersion).toHaveBeenCalledWith(expect.objectContaining({ projectId: 21, html: expect.any(String) }));
    expect(dbMocks.recordProjectActivity).toHaveBeenCalledWith(expect.objectContaining({ type: "generated" }));
  });

  it("does not download an unowned project", async () => {
    dbMocks.getLandingProject.mockResolvedValue(undefined);
    const caller = appRouter.createCaller(createContext(user));
    await expect(caller.projects.download({ projectId: 77 })).rejects.toThrow("Landing project not found.");
  });
});
