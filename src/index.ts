import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { errorMiddleware } from "./middlewares/errors/error.middleware.js";
import { projectRoutes } from "./modules/projects/index.js";
import { analysisRoutes } from "./modules/analysis/index.js";
import { secureHeaders } from 'hono/secure-headers'
import { limiter } from "./config/rateLimit.js";
import { cacheConfig } from "./config/cache.js";
import { csrf } from 'hono/csrf'
import { cache } from 'hono/cache'
import { RouteError } from "./utils/errors/customErrors.js";
import { authMiddleware } from "./middlewares/auth/auth.middleware.js";

const app = new Hono({ strict: false });
app.use(secureHeaders())
app.use(csrf())
app.use(limiter);
app.get('*',cache(cacheConfig));
app.use(authMiddleware)
app.route("/projects", projectRoutes);
app.route("/projects", analysisRoutes);

app.notFound(() => {
  throw new RouteError("Route not found");
})

app.onError(errorMiddleware);

const port = process.env.PORT ? Number(process.env.PORT) : 3000;
console.log(`Server running on http://localhost:${port}`);
serve({ fetch: app.fetch, port });

export { app, serve }
