import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  landingProjects,
  landingVersions,
  projectActivities,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

async function requireDb() {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await requireDb();
  const values: InsertUser = { openId: user.openId, lastSignedIn: new Date() };
  const updateSet: Record<string, unknown> = { lastSignedIn: new Date() };

  (["name", "email", "loginMethod"] as const).forEach(field => {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  });

  values.role = user.role ?? (user.openId === ENV.ownerOpenId ? "admin" : "user");
  updateSet.role = values.role;
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function createLandingProject(ownerId: number, name: string, prompt: string, html: string) {
  const db = await requireDb();
  const result = await db.insert(landingProjects).values({ ownerId, name, prompt, currentHtml: html });
  const id = Number(result[0].insertId);
  const project = await db.select().from(landingProjects).where(eq(landingProjects.id, id)).limit(1);
  return project[0];
}

export async function listLandingProjects(ownerId: number) {
  const db = await requireDb();
  return db.select().from(landingProjects).where(eq(landingProjects.ownerId, ownerId)).orderBy(desc(landingProjects.updatedAt));
}

export async function getLandingProject(ownerId: number, projectId: number) {
  const db = await requireDb();
  const rows = await db.select().from(landingProjects).where(and(eq(landingProjects.ownerId, ownerId), eq(landingProjects.id, projectId))).limit(1);
  return rows[0];
}

export async function updateLandingProject(ownerId: number, projectId: number, input: { name?: string; prompt?: string; currentHtml?: string }) {
  const db = await requireDb();
  await db.update(landingProjects).set(input).where(and(eq(landingProjects.ownerId, ownerId), eq(landingProjects.id, projectId)));
  return getLandingProject(ownerId, projectId);
}

export async function deleteLandingProject(ownerId: number, projectId: number) {
  const db = await requireDb();
  await db.delete(landingProjects).where(and(eq(landingProjects.ownerId, ownerId), eq(landingProjects.id, projectId)));
}

export async function createLandingVersion(input: { projectId: number; prompt: string; configJson: string; html: string }) {
  const db = await requireDb();
  const result = await db.insert(landingVersions).values(input);
  const id = Number(result[0].insertId);
  const version = await db.select().from(landingVersions).where(eq(landingVersions.id, id)).limit(1);
  return version[0];
}

export async function listLandingVersions(ownerId: number, projectId: number) {
  const db = await requireDb();
  return db.select({ version: landingVersions }).from(landingVersions).innerJoin(landingProjects, eq(landingVersions.projectId, landingProjects.id)).where(and(eq(landingProjects.ownerId, ownerId), eq(landingVersions.projectId, projectId))).orderBy(desc(landingVersions.createdAt));
}

export async function recordProjectActivity(input: { projectId: number; actorId: number; type: string; message: string }) {
  const db = await requireDb();
  await db.insert(projectActivities).values(input);
}

export async function listRecentProjectActivities(ownerId: number, limit = 6) {
  const db = await requireDb();
  return db.select({ id: projectActivities.id, projectId: projectActivities.projectId, projectName: landingProjects.name, type: projectActivities.type, message: projectActivities.message, createdAt: projectActivities.createdAt }).from(projectActivities).innerJoin(landingProjects, eq(projectActivities.projectId, landingProjects.id)).where(eq(landingProjects.ownerId, ownerId)).orderBy(desc(projectActivities.createdAt)).limit(limit);
}
