import { Context } from "hono";
import { Prisma } from "@prisma/client";
import { AppError } from "../../utils/errors/customErrors.js";
import { StatusCode } from "hono/utils/http-status";
import { logErrorWithId } from "../../utils/logger/logger.js";

export const errorMiddleware = (error: Error, ctx: Context): Response => {
  const errorId = logErrorWithId(error);
  let statusCode: StatusCode = 500;
  let message = "Internal server error";
  if (error instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = "Invalid request, please verify sent data";
  } else if (error instanceof Prisma.PrismaClientInitializationError) {
    statusCode = 500;
    message = "Unable to reach database";
  } else if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    statusCode = 500;
    message = "Unknown error in database";
  } else if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    statusCode = error.statusCode || null;
  } else if (error instanceof Error) {
    message = error.message;
  }
  ctx.status(statusCode);
  const errorContent = {
    errorId,
    error: message,
    ...(statusCode && { statusCode }),
  };
  return ctx.json(errorContent);
};
