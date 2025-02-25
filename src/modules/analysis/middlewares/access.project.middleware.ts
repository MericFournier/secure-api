import { Context, Next } from "hono";
import { ForbiddenError } from "../../../utils/errors/customErrors.js";
import { assertUserPermissionOnProject } from "../../../utils/projects/assertUserPermissionOnProject.js";
import { Project } from "../../projects/entities/project.entity.js";
import {
  IsAdminType,
  RoleNameType,
  UserIdType,
} from "utils/types/prisma-types.js";

export const projectAccessMiddleware = async (
  ctx: Context,
  next: Next,
): Promise<void> => {
  const projectContext: Project = ctx.get("project");
  const userId: UserIdType = ctx.get("userId") as number;
  const isAdmin: IsAdminType = ctx.get("isAdmin") as boolean;
  const userRole: RoleNameType = ctx.get("userRole") as string;
  const method: string = ctx.req.method;
  const isWriting: boolean = method === "POST";
  if (isWriting && userRole === "READER") {
    throw new ForbiddenError(
      `Unauthorized attempt to write in project (ID: ${projectContext.id})`,
    );
  }
  assertUserPermissionOnProject(projectContext, userId, isAdmin, isWriting);
  return next();
};
