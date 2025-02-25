import { Context, Next } from "hono";
import prisma from "../../../../prisma/prisma.js";
import { assertProjectExists } from "../../../utils/projects/assertProjectExists.js";
import { ValidationError } from "../../../utils/errors/customErrors.js";
import { Project } from "../../projects/entities/project.entity.js";
import {
  ProjectNameType,
  ProjectIdType,
  ProjectCreatedByType,
  ProjectAccessUserIdType,
  ProjectAccessProjectIdType,
} from "utils/types/prisma-types.js";

type ProjectApiResponse = {
  id: ProjectIdType;
  name: ProjectNameType;
  createdBy: ProjectCreatedByType;
  createdAt: Date;
  updatedAt: Date;
  projectAccess: {
    userId: ProjectAccessUserIdType;
    projectId: ProjectAccessProjectIdType;
  }[];
};

export const projectMiddleware = async (
  ctx: Context,
  next: Next,
): Promise<void> => {
  const projectId: ProjectIdType = Number(ctx.req.param("projectId"));
  if (!projectId) {
    throw new ValidationError("Missing project's ID");
  }
  const projectItem: ProjectApiResponse = await assertProjectExists(
    projectId,
    (projectId) =>
      prisma.project.findUnique({
        where: { id: projectId },
        include: { projectAccess: true },
      }),
  );

  const projectAsEntity: Project = new Project(
    projectItem.id,
    projectItem.name,
    projectItem.createdBy,
    projectItem.projectAccess,
  );
  ctx.set("project", projectAsEntity);
  return next();
};
