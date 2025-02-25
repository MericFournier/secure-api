import { test_tokens, app, userRoleToken } from "../../../../tests/integration/setup.js";


describe("Integration tests for Analysis routes", () => {
  describe("Get all analyses", () => {
    it("An admin retrieves all analyses of a project they created", async () => {
      const response = await app.request("/projects/1/analyses", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${test_tokens[userRoleToken.admin]}`,
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual([
        { id: 1, name: "Analyse Admin 1" },
        { id: 2, name: "Analyse Admin 2" },
      ]);
    });

    it("An admin retrieves all analyses of a project shared with them", async () => {
      const response = await app.request("/projects/3/analyses", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${test_tokens[userRoleToken.admin]}`,
        },
      });

      const data = await response.json();
      expect(data).toEqual([
        { id: 3, name: "Analyse Manager 1" },
        { id: 4, name: "Analyse Manager 2" },
        { id: 5, name: "Analyse Projet Partagé" },
      ]);
    });

    it("An admin retrieves all analyses of a project not shared with them", async () => {
      const response = await app.request("/projects/4/analyses", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${test_tokens[userRoleToken.admin]}`,
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual([{ id: 6, name: "Analyse secrète" }]);
    });

    it("A manager retrieves the analyses of a project they created", async () => {
      const response = await app.request("/projects/3/analyses", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${test_tokens[userRoleToken.manager]}`,
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual([
        { id: 3, name: "Analyse Manager 1" },
        { id: 4, name: "Analyse Manager 2" },
        { id: 5, name: "Analyse Projet Partagé" },
      ]);
    });

    it("A manager retrieves the analyses of a project shared with them", async () => {
      const response = await app.request("/projects/2/analyses", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${test_tokens[userRoleToken.manager]}`,
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual([{ id: 7, name: "Analyse longue" }]);
    });

    it("An error is raised if the manager is neither the owner nor invited", async () => {
      const response = await app.request("/projects/5/analyses", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${test_tokens[userRoleToken.manager]}`,
        },
      });

      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data).toHaveProperty(
        "error",
        "Unauthorized access (ID: 5)",
      );
    });

    it("A reader retrieves the analyses of a project shared with them", async () => {
      const response = await app.request("/projects/3/analyses", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${test_tokens[userRoleToken.reader]}`,
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual([
        { id: 3, name: "Analyse Manager 1" },
        { id: 4, name: "Analyse Manager 2" },
        { id: 5, name: "Analyse Projet Partagé" },
      ]);
    });

    it("Throw error for unauthorized users", async () => {
      const response = await app.request("/projects/2/analyses", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${test_tokens[userRoleToken.reader]}`,
        },
      });

      const data = await response.json();
      expect(data).toHaveProperty(
        "error",
        "Unauthorized access (ID: 2)",
      );
    });

    it("An error is raised if the project does not exist", async () => {
      const response = await app.request("/projects/999/analyses", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${test_tokens[userRoleToken.admin]}`,
        },
      });
      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data).toHaveProperty(
        "error",
        "Project not found (ID: 999)",
      );
    });
  });

  describe("Get one analysis", () => {
    it("An admin retrieves an analysis in a project they created", async () => {
      const response = await app.request("/projects/1/analyses/1", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${test_tokens[userRoleToken.admin]}`,
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual({ id: 1, name: "Analyse Admin 1" });
    });

    it("An admin retrieves an analysis in a project shared with them", async () => {
      const response = await app.request("/projects/3/analyses/5", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${test_tokens[userRoleToken.admin]}`,
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual({ id: 5, name: "Analyse Projet Partagé" });
    });

    it("An admin retrieves an analysis in a project not shared with them", async () => {
      const response = await app.request("/projects/4/analyses/6", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${test_tokens[userRoleToken.admin]}`,
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual({ id: 6, name: "Analyse secrète" });
    });

    it("A manager retrieves an analysis in a project they created", async () => {
      const response = await app.request("/projects/3/analyses/3", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${test_tokens[userRoleToken.manager]}`,
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual({ id: 3, name: "Analyse Manager 1" });
    });

    it("A manager retrieves an analysis in a project shared with them", async () => {
      const response = await app.request("/projects/2/analyses/7", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${test_tokens[userRoleToken.manager]}`,
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual({ id: 7, name: "Analyse longue" });
    });

    it("An error is raised if the manager is neither the owner nor invited", async () => {
      const response = await app.request("/projects/5/analyses/8", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${test_tokens[userRoleToken.manager]}`,
        },
      });

      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data).toHaveProperty("error", "Unauthorized access (ID: 5)");
    });

    it("A reader retrieves an analysis in a project shared with them", async () => {
      const response = await app.request("/projects/3/analyses/5", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${test_tokens[userRoleToken.reader]}`,
        },
      });

      const data = await response.json();
      expect(data).toEqual({ id: 5, name: "Analyse Projet Partagé" });
    });

    it("An error is raised if the reader is not invited", async () => {
      const response = await app.request("/projects/2/analyses/7", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${test_tokens[userRoleToken.reader]}`,
        },
      });

      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data).toHaveProperty("error", "Unauthorized access (ID: 2)");
    });

    it("An error is raised if the analysis does not exist", async () => {
      const response = await app.request("/projects/1/analyses/999", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${test_tokens[userRoleToken.admin]}`,
        },
      });

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data).toHaveProperty("error", "Analysis not found (ID: 999)");
    });
  });

  describe("Create an analysis", () => {
    it("An admin creates an analysis in a project they created", async () => {
      const response = await app.request("/projects/1/analyses", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${test_tokens[userRoleToken.admin]}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: "New Admin Analysis" }),
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data).toEqual(
        expect.objectContaining({ name: "New Admin Analysis" }),
      );
    });

    it("An admin creates an analysis in a project shared with them", async () => {
      const response = await app.request("/projects/3/analyses", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${test_tokens[userRoleToken.admin]}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: "Shared Admin Analysis" }),
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data).toEqual(
        expect.objectContaining({ name: "Shared Admin Analysis" }),
      );
    });

    it("An admin creates an analysis in a project not shared with them", async () => {
      const response = await app.request("/projects/4/analyses", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${test_tokens[userRoleToken.admin]}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: "Secret Admin Analysis" }),
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data).toEqual(
        expect.objectContaining({ name: "Secret Admin Analysis" }),
      );
    });

    it("A manager creates an analysis in a project they created", async () => {
      const response = await app.request("/projects/3/analyses", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${test_tokens[userRoleToken.manager]}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: "Private Manager Analysis" }),
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data).toEqual(
        expect.objectContaining({ name: "Private Manager Analysis" }),
      );
    });

    it("An error is raised if a manager creates an analysis in a project shared with them", async () => {
      const response = await app.request("/projects/2/analyses", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${test_tokens[userRoleToken.manager]}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: "Shared Manager Analysis" }),
      });

      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data).toHaveProperty(
        "error",
        "Unauthorized access (ID: 2)",
      );
    });

    it("An error is raised if the manager is neither the owner nor invited", async () => {
      const response = await app.request("/projects/5/analyses", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${test_tokens[userRoleToken.manager]}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: "Illegitimate Analysis" }),
      });

      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data).toHaveProperty(
        "error",
        "Unauthorized access (ID: 5)",
      );
    });

    it("An error is raised if a reader tries to create an analysis", async () => {
      const response = await app.request("/projects/3/analyses", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${test_tokens[userRoleToken.reader]}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: "Reader Analysis" }),
      });

      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data).toHaveProperty(
        "error",
        "Unauthorized attempt to write in project (ID: 3)",
      );
    });

    it("An error is raised if the project does not exist", async () => {
      const response = await app.request("/projects/999/analyses", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${test_tokens[userRoleToken.admin]}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: "Ghost Analysis" }),
      });

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data).toHaveProperty("error", "Project not found (ID: 999)");
    });

    it("An error is raised if the analysis has an empty name", async () => {
      const response = await app.request("/projects/1/analyses", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${test_tokens[userRoleToken.admin]}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: "" }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data).toHaveProperty("error", "Le nom de l'analyse est requis");
    });
  });
});
