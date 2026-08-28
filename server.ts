import "dotenv/config";
import express from "express";
import { createServer } from "node:http";
import path from "node:path";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./server/_core/oauth.js";
import { registerStorageProxy } from "./server/_core/storageProxy.js";
import { appRouter } from "./server/routers.js";
import { createContext } from "./server/_core/context.js";

const app = express();
const server = createServer(app);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

registerStorageProxy(app);
registerOAuthRoutes(app);

app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  }),
);

const distPath = path.resolve(process.cwd(), "dist", "public");
app.use(express.static(distPath));
app.get("*", (_req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

const port = Number(process.env.PORT || 3000);
server.listen(port, () => {
  console.log(`LandMake full-stack server listening on port ${port}`);
});

export default app;
