import { AnalysisRepository } from "../repositories/analysis.repository.js";
import { AnalysisResponseDTO, CreateAnalysisDTO } from "../dtos/analysis.dto.js";
import prisma from "../../../../prisma/prisma.js";
import { ProjectService } from "../../projects/services/project.service.js";
import { NotFoundError } from "../../../utils/errors/customErrors.js";
import { 
  getAnalysesByProjectSchema, 
  getAnalysisByProjectSchema, 
  createAnalysisSchema 
} from "../schemas/analysis.validator.js";
import {
  UserIdType,
  IsAdminType,
  AnalysisIdType,
  ProjectIdType,
  RoleNameType
} from "../../../utils/types/prisma-types.js";
import { ZodValidateData } from "../../../utils/validator/zod.validator.js";

export class AnalysisService {
  private analysisRepo: AnalysisRepository;

  constructor(analysisRepo?: AnalysisRepository, projectService?: ProjectService) {
    this.analysisRepo = analysisRepo ?? new AnalysisRepository(prisma);
  }

  async getAnalysesByProject(projectId: ProjectIdType, userId: UserIdType, isAdmin: IsAdminType): Promise<AnalysisResponseDTO[]> {
    const params = ZodValidateData(getAnalysesByProjectSchema, { projectId, userId, isAdmin });
    const analyses = await this.analysisRepo.findAllByProject(params.projectId, params.userId, params.isAdmin);
    const analysesDTOs = analyses.map((analyse) => analyse.toDTO());
    return analysesDTOs;
  }

  async getAnalysisByProject(projectId: ProjectIdType, analysisId: AnalysisIdType, userId: UserIdType, isAdmin: IsAdminType): Promise<AnalysisResponseDTO | null> {
    const params = ZodValidateData(getAnalysisByProjectSchema, { projectId, analysisId, userId, isAdmin });
    const analysis = await this.analysisRepo.findByIdByProject(params.projectId, params.analysisId, params.userId, params.isAdmin);
    if (!analysis) {
      throw new NotFoundError(`Analysis not found (ID: ${analysisId})`);
    }
    return analysis.toDTO();
  }

  async createAnalysis(dto: CreateAnalysisDTO, userId: UserIdType, userRole: RoleNameType, isAdmin: IsAdminType): Promise<AnalysisResponseDTO> {
    const {name, projectId} = dto;
    const params = ZodValidateData(createAnalysisSchema, { name, projectId, userId, userRole, isAdmin });
    const analysis = await this.analysisRepo.createAnalysis(params.name, params.projectId, userId);
    return analysis.toDTO();
  }
}
