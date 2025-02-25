import { ProjectRepository } from "./project.repository.js";
import { Project } from "../entities/project.entity.js";
import { PrismaClient } from "@prisma/client";
import { mockDeep, DeepMockProxy } from "jest-mock-extended";

let prismaMock: DeepMockProxy<PrismaClient>;
let projectRepo: ProjectRepository;

beforeEach(() => {
  prismaMock = mockDeep<PrismaClient>();
  projectRepo = new ProjectRepository(prismaMock as unknown as PrismaClient);

  prismaMock.$transaction.mockImplementation(async (callback: any) => {
    return callback(prismaMock);
  });
});

describe("ProjectRepository", () => {
  describe("findAll()", () => {
    it("returns all projects", async () => {
      prismaMock.project.findMany.mockResolvedValue([
        { id: 1, name: "Project A", createdBy: 1, projectAccess: [] },
        { id: 2, name: "Project B", createdBy: 2, projectAccess: [] },
      ] as any);

      const result = await projectRepo.findAll();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(new Project(1, "Project A", 1, []));
      expect(result[1]).toEqual(new Project(2, "Project B", 2, []));
    });
  });

  describe("findAccessibleProjects()", () => {
    it("returns projects accessible by a given user", async () => {
      prismaMock.project.findMany.mockResolvedValue([
        { id: 3, name: "Project C", createdBy: 3, projectAccess: [{ projectId: 3, userId: 1 }] },
      ] as any);

      const result = await projectRepo.findAccessibleProjects(1);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(new Project(3, "Project C", 3, [{ projectId: 3, userId: 1 }]));
    });
  });

  describe("findByIdWithAccess()", () => {
    it("returns a project with its access information", async () => {
      prismaMock.project.findUnique.mockResolvedValue({
        id: 4,
        name: "Project D",
        createdBy: 4,
        projectAccess: [{ projectId: 4, userId: 5 }, { projectId: 4, userId: 6 }],
      } as any);

      const result = await projectRepo.findByIdWithAccess(4);

      expect(result).toEqual(
        new Project(4, "Project D", 4, [{ projectId: 4, userId: 5 }, { projectId: 4, userId: 6 }])
      );
    });
  });

  describe("createProject()", () => {
    it("creates a project without access if projectAccess is not provided", async () => {
      prismaMock.project.create.mockResolvedValue({
        id: 10,
        name: "New Project",
        createdBy: 1,
      } as any);

      const result = await projectRepo.createProject("New Project", 1);

      expect(result).toEqual(new Project(10, "New Project", 1));
      expect(prismaMock.project.create).toHaveBeenCalledWith({
        data: { name: "New Project", createdBy: 1 },
      });
      expect(prismaMock.projectAccess.createMany).not.toHaveBeenCalled();
    });

    it("creates a project with access if projectAccess is provided with existing users", async () => {
      prismaMock.project.create.mockResolvedValue({
        id: 20,
        name: "Project With Access",
        createdBy: 2,
      } as any);
      prismaMock.user.findMany.mockResolvedValue([{ id: 3 }, { id: 4 }] as any);
    
      prismaMock.projectAccess.createMany.mockResolvedValue({ count: 2 } as any);

      const accessList = [3, 4];
      const result = await projectRepo.createProject("Project With Access", 2, accessList);

      expect(result).toEqual(new Project(20, "Project With Access", 2));
      expect(prismaMock.project.create).toHaveBeenCalledWith({
        data: { name: "Project With Access", createdBy: 2 },
      });
      expect(prismaMock.projectAccess.createMany).toHaveBeenCalledWith({
        data: [
          { userId: 3, projectId: 20 },
          { userId: 4, projectId: 20 },
        ],
      });
    });

    it("throws an error if a project is created with user access containing non-existent users", async () => {
      prismaMock.project.create.mockResolvedValue({
        id: 20,
        name: "Project With Access",
        createdBy: 2,
      } as any);
      prismaMock.user.findMany.mockResolvedValue([{ id: 3 }] as any);
      prismaMock.projectAccess.createMany.mockResolvedValue({ count: 2 } as any);
      const accessList = [3, 4];
      await expect(
        projectRepo.createProject("Project With Access", 2, accessList)
      ).rejects.toThrow("Following users doesn't exist: 4");
    });
  });
});
