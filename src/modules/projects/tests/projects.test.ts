import { test_tokens, app, userRoleToken } from "../../../../tests/integration/setup.js";

describe("Integration tests for Projects routes", () => {
  describe("Get all projects", () => {
    it("Admin retrieves all projects", async () => {
      const response = await app.request("/projects", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${test_tokens[userRoleToken.admin]}`,
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual([
        { id: 1, name: 'Projet Admin 1' },
        { id: 2, name: 'Projet Admin 2' },
        { id: 3, name: 'Projet Manager 1' },
        { id: 4, name: 'Projet Manager 2' },
        { id: 5, name: 'Projet admin secret' }
      ]);
    });

    it("Manager retrieves all their projects", async () => {
      const response = await app.request("/projects", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${test_tokens[userRoleToken.manager]}`,
        },
      });
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual([
        { id: 2, name: 'Projet Admin 2' },
        { id: 3, name: 'Projet Manager 1' },
        { id: 4, name: 'Projet Manager 2' }
      ]);
    });

    it("Reader retrieves all their projects", async () => {
      const response = await app.request("/projects", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${test_tokens[userRoleToken.reader]}`,
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual([{ id: 3, name: "Projet Manager 1" }]);
    });
  });

  describe("Get one project", () => {
    it("Admin retrieves their project", async () => {
      const response = await app.request("/projects/1", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${test_tokens[userRoleToken.admin]}`,
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual({ id: 1, name: 'Projet Admin 1' });
    });

    it("Admin retrieves a non-shared project", async () => {
      const response = await app.request("/projects/4", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${test_tokens[userRoleToken.admin]}`,
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual({ id: 4, name: 'Projet Manager 2' });
    });
    
    it("Admin retrieves a shared project", async () => {
      const response = await app.request("/projects/3", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${test_tokens[userRoleToken.admin]}`,
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual({ id: 3, name: 'Projet Manager 1' });
    });

    it("Manager retrieves their project", async () => {
      const response = await app.request("/projects/3", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${test_tokens[userRoleToken.manager]}`,
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual({ id: 3, name: 'Projet Manager 1' });
    });

    it("Manager retrieves a shared project", async () => {
      const response = await app.request("/projects/2", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${test_tokens[userRoleToken.manager]}`,
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual({ id: 2, name: 'Projet Admin 2' });
    });

    it("Manager retrieves a non-shared project and receives an error", async () => {
      const response = await app.request("/projects/1", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${test_tokens[userRoleToken.manager]}`,
        },
      });
      const data = await response.json();
      expect(data).toHaveProperty("errorId");
      expect(data).toHaveProperty("error", "Unauthorized access (ID: 1)");
    });

    it("Reader retrieves a shared project", async () => {
      const response = await app.request("/projects/3", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${test_tokens[userRoleToken.reader]}`,
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual({ id: 3, name: 'Projet Manager 1' });
    });

    it("Reader retrieves a non-shared project and receives an error", async () => {
      const response = await app.request("/projects/4", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${test_tokens[userRoleToken.reader]}`,
        },
      });
      const data = await response.json();
      expect(data).toHaveProperty("errorId");
      expect(data).toHaveProperty("error", "Unauthorized access (ID: 4)");
    });
  });

  describe("Create project", () => {
    it("Admin creates a non-shared project", async () => {
      const response = await app.request("/projects", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${test_tokens[userRoleToken.admin]}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: "New Secret Admin Project" }),
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data).toEqual(expect.objectContaining({ name: "New Secret Admin Project" }));
    });

    it("Manager creates a non-shared project", async () => {
      const response = await app.request("/projects", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${test_tokens[userRoleToken.manager]}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: "New Secret Manager Project" }),
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data).toEqual(expect.objectContaining({ name: "New Secret Manager Project" }));
    });

    it("Reader attempts to create a non-shared project and receives an error", async () => {
      const response = await app.request("/projects", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${test_tokens[userRoleToken.reader]}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: "New Secret Reader Project" }),
      });

      const data = await response.json();
      expect(data).toHaveProperty("errorId");
      expect(data).toHaveProperty("error", "Unauthorized attempt to create a project.");
    });
  });

  describe("Share project", () => {
    let newAdminCreatedProjectId: any;
    let newManagerCreatedProjectId: any;

    it("Manager creates a shared project", async () => {
      const response = await app.request("/projects", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${test_tokens[userRoleToken.manager]}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: "New Shared Manager Project", projectAccess: [3] }),
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data).toEqual(expect.objectContaining({ name: "New Shared Manager Project" }));
      newManagerCreatedProjectId = data.id;
    });

    it("Admin creates a shared project", async () => {
      const response = await app.request("/projects", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${test_tokens[userRoleToken.admin]}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: "New Shared Admin Project", projectAccess: [2] }),
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data).toEqual(expect.objectContaining({ name: "New Shared Admin Project" }));
      newAdminCreatedProjectId = data.id;
    });

    it("Manager accesses the new admin shared project", async () => {
      const response = await app.request(`/projects/${newAdminCreatedProjectId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${test_tokens[userRoleToken.manager]}`,
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual({ id: parseInt(newAdminCreatedProjectId), name: 'New Shared Admin Project' });
    });

    it("Reader accesses the new manager shared project", async () => {
      const response = await app.request(`/projects/${newManagerCreatedProjectId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${test_tokens[userRoleToken.reader]}`,
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual({ id: parseInt(newManagerCreatedProjectId), name: 'New Shared Manager Project' });
    });
  });
});
