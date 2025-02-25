import { ProjectService } from "./project.service.js";
import { ProjectRepository } from "../repositories/project.repository.js";
import { Project } from "../entities/project.entity.js";
import {
  NotFoundError,
  ForbiddenError,
  ValidationError,
} from "../../../utils/errors/customErrors.js";
import { mockDeep, DeepMockProxy } from "jest-mock-extended";

const projectRepoMock = mockDeep<ProjectRepository>();
const projectService = new ProjectService(projectRepoMock as unknown as ProjectRepository);

describe("ProjectService", () => {
  beforeEach(() => {
    projectRepoMock.findAll.mockReset();
    projectRepoMock.findAccessibleProjects.mockReset();
    projectRepoMock.findByIdWithAccess.mockReset();
    projectRepoMock.createProject.mockReset();
  });

  describe("getProjects()", () => {
    it("An Administrator retrieves all projects", async () => {
      projectRepoMock.findAll.mockResolvedValue([
        new Project(1, "My Project", 1, []),
        new Project(2, "Shared Project", 2, [{ projectId: 2, userId: 1 }]),
        new Project(3, "Non-shared Project", 2, []),
      ]);
      const result = await projectService.getProjects(1, true);
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual(expect.objectContaining(new Project(1, "My Project", 1).toDTO()));
      expect(result[1]).toEqual(expect.objectContaining(new Project(2, "Shared Project", 2).toDTO()));
      expect(result[2]).toEqual(expect.objectContaining(new Project(3, "Non-shared Project", 2).toDTO()));
    });

    it("A Manager retrieves only their own projects and those shared with them", async () => {
      projectRepoMock.findAccessibleProjects.mockResolvedValue([
        new Project(3, "My Project", 2, [{ projectId: 3, userId: 1 }]),
        new Project(4, "Shared Project", 1, [{ projectId: 4, userId: 1 }]),
      ]);

      const result = await projectService.getProjects(2, false);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(expect.objectContaining(new Project(3, "My Project", 2, [{ projectId: 3, userId: 1 }]).toDTO()));
      expect(result[1]).toEqual(expect.objectContaining(new Project(4, "Shared Project", 1, [{ projectId: 4, userId: 1 }]).toDTO()));
    });

    it("A Reader retrieves only their own projects and those shared with them", async () => {
      projectRepoMock.findAccessibleProjects.mockResolvedValue([
        new Project(3, "My Project", 2, [{ projectId: 3, userId: 2 }]),
      ]);

      const result = await projectService.getProjects(3, false);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(expect.objectContaining(new Project(3, "My Project", 2, [{ projectId: 3, userId: 2 }]).toDTO()));
    });

    it("A user without projects gets an empty array", async () => {
      projectRepoMock.findAccessibleProjects.mockResolvedValue([]);
      const result = await projectService.getProjects(10, false);
      expect(result).toEqual([]);
    });

    it("Throws ValidationError for a user with an invalid userId", async () => {
      await expect(projectService.getProjects(NaN as any, true)).rejects.toThrow(ValidationError);
      await expect(projectService.getProjects(undefined as any, true)).rejects.toThrow(ValidationError);
    });

    it("Throws ValidationError for a user with an invalid isAdmin flag", async () => {
      await expect(projectService.getProjects(1, "not-a-boolean" as any)).rejects.toThrow(ValidationError);
    });
  });

  describe("getProject()", () => {
    it("Throws NotFoundError if the project does not exist", async () => {
      projectRepoMock.findByIdWithAccess.mockResolvedValue(null);
      await expect(projectService.getProject(1, 1, true)).rejects.toThrow(NotFoundError);
    });

    it("An Administrator accesses the project without additional checks", async () => {
      projectRepoMock.findByIdWithAccess.mockResolvedValue(
        new Project(12, "Secret Project", 17, [])
      );
      const resultForAdmin = await projectService.getProject(12, 1, true);
      expect(resultForAdmin).toEqual(expect.objectContaining(new Project(12, "Secret Project", 17, []).toDTO()));
      await expect(projectService.getProject(12, 1, false)).rejects.toThrow(ForbiddenError);
    });

    it("A non-admin user with access (owner) accesses the project", async () => {
      projectRepoMock.findByIdWithAccess.mockResolvedValue(
        new Project(2, "Personal Project", 5, [])
      );

      const result = await projectService.getProject(2, 5, false);
      expect(result).toEqual(expect.objectContaining(new Project(2, "Personal Project", 5, []).toDTO()));
    });

    it("A non-admin user with access (via projectAccess) accesses the project", async () => {
      projectRepoMock.findByIdWithAccess.mockResolvedValue(
        new Project(3, "Shared Project", 7, [{ projectId: 3, userId: 2 }])
      );

      const result = await projectService.getProject(3, 2, false);
      expect(result).toEqual(expect.objectContaining(new Project(3, "Shared Project", 7, [{ projectId: 3, userId: 2 }]).toDTO()));
    });

    it("A non-admin user without access throws ForbiddenError", async () => {
      projectRepoMock.findByIdWithAccess.mockResolvedValue(
        new Project(4, "Private Project", 8, [{ projectId: 4, userId: 9 }])
      );
      await expect(projectService.getProject(4, 2, false)).rejects.toThrow(ForbiddenError);
    });
  });

  describe("findProjectById()", () => { 
    it("should return project as DTO", async () => {
      projectRepoMock.findByIdWithAccess.mockResolvedValue(
        new Project(4, "Private Project", 8, [{ projectId: 4, userId: 9 }])
      );
      const result = await projectService.findProjectById(1);
      expect(result).toEqual({ id: 4, name: 'Private Project', createdBy: 8, projectAccess: [9] });
    });
  });

  describe("createProject()", () => {
    const validDto = { name: "New Project", projectAccess: [10, 20] };
    const userId = 1;
    const managerRole = "MANAGER";
    const readerRole = "READER";

    it("Throws ForbiddenError if the role is READER", async () => {
      await expect(projectService.createProject(validDto, userId, readerRole)).rejects.toThrow(ForbiddenError);
    });

    it("Throws ValidationError if the project name is invalid", async () => {
      const invalidDto = { name: "", projectAccess: [10, 20] };
      await expect(projectService.createProject(invalidDto, userId, managerRole)).rejects.toThrow(ValidationError);
    });

    it("Throws ValidationError if projectAccess is not an array", async () => {
      const invalidDto = { name: "Test Project", projectAccess: "not-an-array" as any };
      await expect(projectService.createProject(invalidDto, userId, managerRole)).rejects.toThrow(ValidationError);
    });

    it("Creates a valid project and returns the DTO", async () => {
      const createdProject = new Project(7, "Created Project", userId, [
        { projectId: 7, userId: 10 },
        { projectId: 7, userId: 20 },
      ]);

      projectRepoMock.createProject.mockResolvedValue(createdProject);

      const result = await projectService.createProject(validDto, userId, managerRole);
      expect(result).toEqual(expect.objectContaining(new Project(7, "Created Project", userId, [{ projectId: 7, userId: 10 }, { projectId: 7, userId: 20 }]).toDTO()));
    });
  });
});
