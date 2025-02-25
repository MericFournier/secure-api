import { Context } from "hono";
import { rateLimiter } from "hono-rate-limiter";

export const limiter = rateLimiter({
  windowMs: 10 * 60 * 1000,
  limit: 200,
  standardHeaders: "draft-6",
  keyGenerator: (c: Context): string => {
    return c.req.header("x-forwarded-for") ?? "";
  },
});
