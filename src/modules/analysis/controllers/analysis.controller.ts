import type { Context } from "hono";
import { AnalysisService } from "../services/analysis.service.js";
import {
  UserIdType,
  IsAdminType,
  AnalysisIdType,
  AnalysisNameType,
  RoleNameType,
  ProjectIdType,
}  from "utils/types/prisma-types.js";
import { Project } from "../../../modules/projects/entities/project.entity.js";

const analysisService = new AnalysisService();

export class AnalysisController {
  static async getAnalysesByProject(ctx: Context): Promise<Response> {
    const projectContext: Project = ctx.get("project");
    const projectId: ProjectIdType = Number(projectContext.id);
    const userId: UserIdType = ctx.get("userId");
    const isAdmin: IsAdminType = ctx.get("isAdmin");

    const analyses = await analysisService.getAnalysesByProject(
      projectId,
      userId,
      isAdmin,
    );
    return ctx.json(analyses, 200);
  }

  static async getAnalysisByProject(ctx: Context): Promise<Response> {
    const projectContext: Project = ctx.get("project");
    const projectId: ProjectIdType = Number(projectContext.id);
    const analysisId: AnalysisIdType = parseInt(ctx.req.param("analysisId"));
    const userId: UserIdType = ctx.get("userId");
    const isAdmin: IsAdminType = ctx.get("isAdmin");

    const analysis = await analysisService.getAnalysisByProject(
      projectId,
      analysisId,
      userId,
      isAdmin,
    );
    return ctx.json(analysis, 200);
  }

  static async createAnalysis(ctx: Context): Promise<Response> {
    const body = await ctx.req.json();
    const projectId: ProjectIdType = parseInt(ctx.req.param("projectId"));
    const userId: UserIdType = ctx.get("userId");
    const isAdmin: IsAdminType = ctx.get("isAdmin");
    const role: RoleNameType = ctx.get("userRole");
    const name: AnalysisNameType = body?.name;
    const newAnalysis = await analysisService.createAnalysis(
      { name, projectId },
      userId,
      role,
      isAdmin,
    );

    return ctx.json(newAnalysis, 201);
  }
}
