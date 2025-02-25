import { Hono } from "hono";
import { AnalysisController } from "../controllers/analysis.controller.js";
import { projectAccessMiddleware } from "../middlewares/access.project.middleware.js";
import { projectMiddleware } from "../middlewares/project.middleware.js";

const analysisRoutes = new Hono();

analysisRoutes.use("/:projectId/*", 
    projectMiddleware, 
    projectAccessMiddleware 
);

analysisRoutes.get("/:projectId/analyses", 
    AnalysisController.getAnalysesByProject
);

analysisRoutes.get("/:projectId/analyses/:analysisId", 
    AnalysisController.getAnalysisByProject
);

analysisRoutes.post("/:projectId/analyses", 
    AnalysisController.createAnalysis
);

export default analysisRoutes;