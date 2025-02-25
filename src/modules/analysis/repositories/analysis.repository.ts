import { PrismaClient } from "@prisma/client";
import { Analysis } from "../entities/analysis.entity.js";
import {
  UserIdType,
  IsAdminType,
  AnalysisIdType,
  AnalysisNameType,
  ProjectIdType,
  PrismaAnalysis
} from "../../../utils/types/prisma-types.js";

export class AnalysisRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async findAllByProject(
    projectId: ProjectIdType,
    userId: UserIdType,
    isAdmin: IsAdminType,
  ): Promise<Analysis[]> {
    const whereClause = isAdmin
      ? { projectId }
      : {
          projectId,
          OR: [
            { createdBy: userId },
            { project: { projectAccess: { some: { userId } } } },
          ],
        };

    const analyses: PrismaAnalysis[] = await this.prisma.analysis.findMany({
      where: whereClause,
    });

    return analyses.map(
      (analysis) =>
        new Analysis(
          analysis.id,
          analysis.name,
          analysis.projectId,
          analysis.createdBy,
        ),
    );
  }

  async findByIdByProject(
    projectId: ProjectIdType,
    analysisId: AnalysisIdType,
    userId: UserIdType,
    isAdmin: IsAdminType,
  ): Promise<Analysis | null> {
    const whereClause = isAdmin
      ? { id: analysisId, projectId }
      : {
          id: analysisId,
          projectId,
          OR: [
            { createdBy: userId },
            { project: { projectAccess: { some: { userId } } } },
          ],
        };

    const analysis: PrismaAnalysis | null = await this.prisma.analysis.findFirst({
      where: whereClause,
    });

    return analysis
      ? new Analysis(
          analysis.id,
          analysis.name,
          analysis.projectId,
          analysis.createdBy,
        )
      : null;
  }

  async createAnalysis(
    name: AnalysisNameType,
    projectId: ProjectIdType,
    createdBy: UserIdType,
  ): Promise<Analysis> {
    const analysis: PrismaAnalysis = await this.prisma.analysis.create({
      data: {
        name,
        projectId,
        createdBy,
      },
    });

    const createdAnalysis = new Analysis(
      analysis.id,
      analysis.name,
      analysis.projectId,
      analysis.createdBy,
    );

    return createdAnalysis;
  }
}
