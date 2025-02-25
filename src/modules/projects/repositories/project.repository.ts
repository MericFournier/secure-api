import { Project } from "../entities/project.entity.js";
import { PrismaClient } from "@prisma/client";
import {
  UserIdType,
  ProjectIdType,
  ProjectCreatedByType,
  ProjectNameType
} from "../../../utils/types/prisma-types.js";
import { assertUsersExist } from "../../../utils/users/assertUsersExists.js";

export class ProjectRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async findAll(): Promise<Project[]> {
    return this.prisma.project
      .findMany({
        include: { projectAccess: true },
      })
      .then((projects) =>
        projects.map(
          (project) => new Project(project.id, project.name, project.createdBy, project.projectAccess),
        ),
      );
  }

  async findAccessibleProjects(userId: UserIdType): Promise<Project[]> {
    return this.prisma.project
      .findMany({
        where: {
          OR: [
            { createdBy: userId },
            { projectAccess: { some: { userId: userId } } },
          ],
        },
        include: {
          projectAccess: {
            include: { user: true },
          },
        },
      })
      .then((projects) =>
        projects.map(
          (project) => new Project(project.id, project.name, project.createdBy, project.projectAccess),
        ),
      );
  }

  async findByIdWithAccess(id: ProjectIdType): Promise<Project | null> {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: { projectAccess: true },
    });
    return project
      ? new Project(
          project.id,
          project.name,
          project.createdBy,
          project.projectAccess,
        )
      : null;
  }

  async createProject(
    name: ProjectNameType,
    createdBy: ProjectCreatedByType,
    projectAccess?: UserIdType[],
  ): Promise<Project> {
    return await this.prisma.$transaction(async (ctx) => {
      const project = await ctx.project.create({
        data: { name, createdBy },
      });   
      if (projectAccess && projectAccess.length > 0) {
        await assertUsersExist(ctx, projectAccess);
        await ctx.projectAccess.createMany({
          data: projectAccess.map((userId) => ({
            userId,
            projectId: project.id,
          })),
        });
      }
      
      return new Project(project.id, project.name, project.createdBy);
    });
  }

  
}