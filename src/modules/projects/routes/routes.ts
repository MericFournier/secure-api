import { Hono } from "hono";
import { ProjectController } from "../controllers/project.controller.js";

const projectRoutes = new Hono();

projectRoutes.get("/", ProjectController.getProjects);
projectRoutes.get("/:id", ProjectController.getProject);
projectRoutes.post("/", ProjectController.createProject);

export default projectRoutes;
