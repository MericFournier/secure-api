import fs from "fs";
import path from "path";
import prisma from "../../prisma/prisma.js";

const populateDatabase = async (): Promise<void> => {
  const filePath = path.resolve("tests/database/seed.json");
  const rawData = fs.readFileSync(filePath, "utf-8");
  const data = JSON.parse(rawData);

  for (const perm of data.permissions) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: perm,
    });
  }

  for (const role of data.roles) {
    await prisma.role.upsert({
      where: { id: role.id },
      update: {},
      create: { id: role.id, name: role.name },
    });
  }

  for (const user of data.users) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: {},
      create: {
        id: user.id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  }

  for (const user of data.users) {
    await prisma.userRole.upsert({
      where: { userId: user.id },
      update: { roleId: user.roleId },
      create: { userId: user.id, roleId: user.roleId },
    });
  }

  for (const project of data.projects) {
    await prisma.project.upsert({
      where: { id: project.id },
      update: {},
      create: {
        id: project.id,
        name: project.name,
        createdBy: project.createdBy,
      },
    });

    for (const userId of project.projectAccess || []) {
      await prisma.projectAccess.create({
        data: {
          userId,
          projectId: project.id,
        },
      });
    }
  }

  for (const analysis of data.analyses) {
    await prisma.analysis.upsert({
      where: { id: analysis.id },
      update: {},
      create: {
        id: analysis.id,
        name: analysis.name,
        projectId: analysis.projectId,
        createdBy: analysis.createdBy,
      },
    });
  }

  for (const rp of data.role_permissions) {
    const permission = await prisma.permission.findUnique({
      where: { name: rp.permissionName },
    });
    if (permission) {
      await prisma.rolePermission.create({
        data: {
          roleId: rp.roleId,
          permissionId: permission.id,
        },
      });
    }
  }
};

populateDatabase()
  .catch((error) => {
    console.error("Erreur lors du remplissage :", error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
