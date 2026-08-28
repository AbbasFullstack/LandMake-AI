import "dotenv/config";
import express from "express";
import path from "node:path";
import { createServer } from "node:http";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./server/_core/oauth.js";
import { registerStorageProxy } from "./server/_core/storageProxy.js";
import { appRouter } from "./server/routers.js";
import { createContext } from "./server/_core/context.js";

export const app = express();

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

app.use((req, res, next) => {
  if (req.method === "GET" && !req.path.startsWith("/api")) {
    res.sendFile(path.join(distPath, "index.html"), (error) => {
      if (error) next(error);
    });
    return;
  }

  next();
});

export function startServer() {
  const server = createServer(app);
  const port = Number(process.env.PORT || 3000);

  server.listen(port, () => {
    console.log(`LandMake full-stack server listening on port ${port}`);
  });

  return server;
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
