import type { Context } from "hono";
import { ProjectService } from "../services/project.service.js";
import { ProjectResponseDTO } from "../dtos/project.dto.js";
import {
  UserIdType,
  IsAdminType,
  ProjectIdType,
  RoleNameType,
} from "utils/types/prisma-types.js";
const projectService = new ProjectService();

export class ProjectController {
  static async getProjects(ctx: Context):Promise<Response>  {
    const userId: UserIdType = ctx.get("userId") as number;
    const isAdmin: IsAdminType = ctx.get("isAdmin") as boolean;
    const projects = await projectService.getProjects(userId, isAdmin);
    return ctx.json(projects, 200);
  }

  static async getProject(ctx: Context):Promise<Response>  {
    const projectId: ProjectIdType = parseInt(ctx.req.param("id"));
    const userId: UserIdType = ctx.get("userId") as number;
    const isAdmin: IsAdminType = ctx.get("isAdmin") as boolean;
    const project: ProjectResponseDTO = await projectService.getProject(projectId, userId, isAdmin);
    return ctx.json(project, 200);
  }

  static async createProject(ctx: Context):Promise<Response>  {
    const body = await ctx.req.json();
    const userId: UserIdType = ctx.get("userId") as number;
    const userRole: RoleNameType = ctx.get("userRole") as string;
    const newProject = await projectService.createProject(
      {
        name: body.name,
        projectAccess: body.projectAccess || [],
      },
      userId,
      userRole,
    );
    return ctx.json(newProject, 201);
  }
}
