import { Context, Next } from "hono";
import jwt from "jsonwebtoken";
const { TokenExpiredError, JsonWebTokenError } = jwt;
import prisma from "../../../prisma/prisma.js";
import { AuthError } from "../../utils/errors/customErrors.js";
import { UserIdType } from "../../utils/types/prisma-types.js";
import { assertUsersExist } from "../../utils/users/assertUsersExists.js";

const JWT_SECRET = process.env.JWT_SECRET as jwt.Secret;

export const authMiddleware = async (
  ctx: Context,
  next: Next,
): Promise<void> => {
  try {
    const authHeader = ctx.req.header("Authorization");
    const token = authHeader?.split(" ")[1];

    if (!authHeader || !authHeader.startsWith("Bearer ") || !token) {
      throw new AuthError("Unauthorized: No token provided");
    }
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { userId: UserIdType };
    } catch (err) {
      if (err instanceof TokenExpiredError) {
        throw new AuthError("Token expired, please login again");
      }
      if (err instanceof JsonWebTokenError) {
        throw new AuthError("Invalid token");
      }
      throw new AuthError("Authentication failed");
    }
    if (!decoded || !decoded.userId) {
      throw new AuthError("Invalid auth token");
    }

    const [userFound] = await prisma.$transaction(tx =>
      assertUsersExist(tx, [decoded.userId])
    );

    if (!userFound || !userFound.userRole) {
      throw new AuthError("User not found or role missing");
    }
    if (
      typeof userFound.id === "undefined" ||
      typeof userFound.isAdmin !== "boolean" ||
      !userFound?.userRole?.role?.name
    ) {
      throw new AuthError("User incomplete or role incomplete");
    }

    ctx.set("userId", userFound.id);
    ctx.set("isAdmin", userFound.isAdmin);
    ctx.set("userRole", userFound.userRole.role.name);
    await next();
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new AuthError(error.message);
    } else {
      throw new AuthError(String(error));
    }
  }
};
