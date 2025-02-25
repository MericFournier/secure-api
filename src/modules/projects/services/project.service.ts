import { ProjectRepository } from "../repositories/project.repository.js";
import type {
  ProjectResponseDTO,
  CreateProjectDTO,
} from "../dtos/project.dto.js";
import prisma from "../../../../prisma/prisma.js";
import {
  ForbiddenError,
} from "../../../utils/errors/customErrors.js";
import {
  UserIdType,
  ProjectIdType,
  IsAdminType,
  RoleNameType
} from "../../../utils/types/prisma-types.js";
import { 
  getProjectsSchema, 
  getProjectSchema, 
  findProjectByIdSchema, 
  createProjectSchema
 } from "../schemas/projects.validator.js";
import { ZodValidateData } from "../../../utils/validator/zod.validator.js";
import { assertProjectExists } from "../../../utils/projects/assertProjectExists.js";
import { assertUserPermissionOnProject } from "../../../utils/projects/assertUserPermissionOnProject.js";


export class ProjectService {
  private projectRepo: ProjectRepository;

  constructor(projectRepo?: ProjectRepository) {
    this.projectRepo = projectRepo ?? new ProjectRepository(prisma);
  }

  async getProjects(
    userId: UserIdType,
    isAdmin: IsAdminType,
  ): Promise<ProjectResponseDTO[]> {
    const params = ZodValidateData(getProjectsSchema, { userId, isAdmin });
    let projects = params.isAdmin ? 
    await this.projectRepo.findAll() 
    : await this.projectRepo.findAccessibleProjects(params.userId);
    const projectDTOs = projects.map((project) => project.toDTO());
    return projectDTOs;
  }

  async getProject(
    projectId: ProjectIdType,
    userId: UserIdType,
    isAdmin: IsAdminType,
  ): Promise<ProjectResponseDTO> {
    const params = ZodValidateData(getProjectSchema, { projectId, userId, isAdmin });
    const project = await assertProjectExists(
      params.projectId,
      (id) => this.projectRepo.findByIdWithAccess(id),
    );
    assertUserPermissionOnProject(
      project,
      params.userId,
      params.isAdmin,
      false
    )
    return project.toDTO();
  }

  async findProjectById(projectId: ProjectIdType): Promise<ProjectResponseDTO | null> {
    const params = ZodValidateData(findProjectByIdSchema, { projectId });
    const project = await assertProjectExists(
      params.projectId,
      (projectId) => this.projectRepo.findByIdWithAccess(projectId),
    );
    const projectDTO = project.toDTO({includeCreatedBy: true, includeProjectAccess: true});
    return projectDTO
  }

  async createProject(
    dto: CreateProjectDTO,
    userId: UserIdType,
    userRole: RoleNameType,
  ): Promise<ProjectResponseDTO> {
    const {name, projectAccess} = dto;
    const params = ZodValidateData(createProjectSchema, {name, projectAccess, userId, userRole });
    if (params.userRole === "READER") {
      throw new ForbiddenError(
        `Unauthorized attempt to create a project.`,
      );
    }
    
    const project = await this.projectRepo.createProject(
      dto.name,
      userId,
      dto.projectAccess,
    );
    return project.toDTO();
  }
}
