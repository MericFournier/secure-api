import { AnalysisService } from "../services/analysis.service.js";
import { AnalysisRepository } from "../repositories/analysis.repository.js";
import { ProjectService } from "../../projects/services/project.service.js";
import { ValidationError } from "../../../utils/errors/customErrors.js";
import { Analysis } from "../entities/analysis.entity.js";
import prisma from "../../../../prisma/prisma.js";


jest.mock("../repositories/analysis.repository.js");
jest.mock("../../projects/services/project.service.js");

describe("AnalysisService", () => {
  let analysisService: AnalysisService;
  let analysisRepoMock: jest.Mocked<AnalysisRepository>;
  let projectServiceMock: jest.Mocked<ProjectService>;

  beforeEach(() => {
    analysisRepoMock = new AnalysisRepository(prisma) as jest.Mocked<AnalysisRepository>;
    projectServiceMock = new ProjectService() as jest.Mocked<ProjectService>;
    analysisService = new AnalysisService(analysisRepoMock, projectServiceMock);
  });

  it("getAnalysesByProject returns the analyses", async () => {
    analysisRepoMock.findAllByProject.mockResolvedValue([
      new Analysis(1, "Analysis 1", 1, 1),
    ]);
    projectServiceMock.findProjectById.mockResolvedValue({ id: 1, name: "Test Project", createdBy: 1 });
    const result = await analysisService.getAnalysesByProject(1, 1, false);
    expect(result).toEqual([{ id: 1, name: "Analysis 1" }]);
  });

  it("returns an empty array if no result", async () => {
    analysisRepoMock.findAllByProject.mockResolvedValue([]);
    projectServiceMock.findProjectById.mockResolvedValue({ id: 1, name: "Test Project", createdBy: 1 });
    const result = await analysisService.getAnalysesByProject(1, 1, false);
    expect(result).toEqual([]);
  });

  it("getAnalysesByProject throws an error if projectId is incorrect", async () => {
    await expect(analysisService.getAnalysesByProject(1.2, 1, false)).rejects.toThrow(ValidationError);
  });

  it("getAnalysisByProject returns the analysis", async () => {
    analysisRepoMock.findByIdByProject.mockResolvedValue(
        new Analysis(1, "Analysis 1", 1, 1)
    );
    projectServiceMock.findProjectById.mockResolvedValue({ id: 1, name: "Test Project", createdBy: 1 });
    const result = await analysisService.getAnalysisByProject(1, 1, 1, false);
    expect(result).toEqual({ id: 1, name: "Analysis 1" });
  });

  it("getAnalysisByProject throws an error if projectId is incorrect", async () => {
    await expect(analysisService.getAnalysisByProject(1.2, 1, 1, false)).rejects.toThrow(ValidationError);
  });

  it("getAnalysisByProject throws an error if analysisId is incorrect", async () => {
    await expect(analysisService.getAnalysisByProject(1, 1.2, 1, false)).rejects.toThrow(ValidationError);
  });

  it("createAnalysis creates an analysis", async () => {
    projectServiceMock.findProjectById.mockResolvedValue({ id: 1, name: "Test Project", createdBy: 1 });
    analysisRepoMock.createAnalysis.mockResolvedValue(new Analysis(1, "New Analysis", 1, 1));
    
    const result = await analysisService.createAnalysis({ name: "New Analysis", projectId: 1 }, 1, "MANAGER", false);
    expect(result).toEqual({ id: 1, name: 'New Analysis' });
  });

  it("createAnalysis throws an error if the name is empty", async () => {
    await expect(
      analysisService.createAnalysis({ name: "", projectId: 1 }, 1, "READER", false)
    ).rejects.toThrow(ValidationError);
  });
});
