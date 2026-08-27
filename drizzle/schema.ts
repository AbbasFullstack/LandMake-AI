import { index, int, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: varchar("role", { length: 32 }).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const landingProjects = mysqlTable(
  "landingProjects",
  {
    id: int("id").autoincrement().primaryKey(),
    ownerId: int("ownerId").notNull().references(() => users.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 120 }).notNull(),
    prompt: text("prompt").notNull(),
    currentHtml: text("currentHtml").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [index("landingProjects_ownerId_idx").on(table.ownerId)],
);

export const landingVersions = mysqlTable(
  "landingVersions",
  {
    id: int("id").autoincrement().primaryKey(),
    projectId: int("projectId").notNull().references(() => landingProjects.id, { onDelete: "cascade" }),
    prompt: text("prompt").notNull(),
    configJson: text("configJson").notNull(),
    html: text("html").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [index("landingVersions_projectId_idx").on(table.projectId)],
);

export const projectActivities = mysqlTable(
  "projectActivities",
  {
    id: int("id").autoincrement().primaryKey(),
    projectId: int("projectId").notNull().references(() => landingProjects.id, { onDelete: "cascade" }),
    actorId: int("actorId").notNull().references(() => users.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 64 }).notNull(),
    message: varchar("message", { length: 255 }).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [index("projectActivities_projectId_idx").on(table.projectId), index("projectActivities_actorId_idx").on(table.actorId)],
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type LandingProject = typeof landingProjects.$inferSelect;
export type LandingVersion = typeof landingVersions.$inferSelect;
export type ProjectActivity = typeof projectActivities.$inferSelect;
