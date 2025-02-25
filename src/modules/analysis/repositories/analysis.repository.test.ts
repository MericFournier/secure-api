import { AnalysisRepository } from "./analysis.repository.js";
import { Analysis } from "../entities/analysis.entity.js";
import { PrismaClient } from "@prisma/client";
import { mockDeep, DeepMockProxy } from "jest-mock-extended";

let prismaMock: DeepMockProxy<PrismaClient>;
let analysisRepo: AnalysisRepository;

beforeEach(() => {
  prismaMock = mockDeep<PrismaClient>();
  analysisRepo = new AnalysisRepository(prismaMock as unknown as PrismaClient);

  prismaMock.$transaction.mockImplementation(async (callback: any) => {
    return callback(prismaMock);
  });
});

describe("AnalysisRepository", () => {
  describe("findAllByProject()", () => {
    it("returns all analyses for a project (admin)", async () => {
      prismaMock.analysis.findMany.mockResolvedValue([
        { id: 1, name: "Analysis 1", projectId: 1, createdBy: 1 },
        { id: 2, name: "Analysis 2", projectId: 1, createdBy: 2 },
      ] as any);

      const result = await analysisRepo.findAllByProject(1, 1, true);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(new Analysis(1, "Analysis 1", 1, 1));
      expect(result[1]).toEqual(new Analysis(2, "Analysis 2", 1, 2));
    });

    it("returns only analyses accessible for a non-admin user", async () => {
      prismaMock.analysis.findMany.mockResolvedValue([
        { id: 1, name: "Analysis 1", projectId: 1, createdBy: 1 },
      ] as any);

      const result = await analysisRepo.findAllByProject(1, 1, false);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(new Analysis(1, "Analysis 1", 1, 1));
    });

    it("returns an empty array if no analyses are found", async () => {
      prismaMock.analysis.findMany.mockResolvedValue([]);

      const result = await analysisRepo.findAllByProject(1, 1, false);

      expect(result).toEqual([]);
    });
  });

  describe("findByIdByProject()", () => {
    it("returns an analysis if it is accessible", async () => {
      prismaMock.analysis.findFirst.mockResolvedValue({
        id: 1,
        name: "Analysis 1",
        projectId: 1,
        createdBy: 1,
      } as any);

      const analysis = await analysisRepo.findByIdByProject(1, 1, 1, false);

      expect(analysis).toEqual(new Analysis(1, "Analysis 1", 1, 1));
    });

    it("returns null if the analysis is not accessible", async () => {
      prismaMock.analysis.findFirst.mockResolvedValue(null);

      const analysis = await analysisRepo.findByIdByProject(1, 1, 1, false);

      expect(analysis).toBeNull();
    });
  });

  describe("createAnalysis()", () => {
    it("creates a new analysis", async () => {
      prismaMock.analysis.create.mockResolvedValue({
        id: 1,
        name: "New Analysis",
        projectId: 1,
        createdBy: 1,
      } as any);

      const analysis = await analysisRepo.createAnalysis("New Analysis", 1, 1);

      expect(analysis).toEqual(new Analysis(1, "New Analysis", 1, 1));
    });

    it("throws an error if Prisma fails", async () => {
      prismaMock.analysis.create.mockRejectedValue(new Error("Prisma create error"));

      await expect(
        analysisRepo.createAnalysis("New Analysis", 1, 1)
      ).rejects.toThrow("Prisma create error");
    });
  });
});
