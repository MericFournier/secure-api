import prisma from "../../prisma/prisma.js";

const resetDatabase = async (): Promise<void> => {
  await prisma.rolePermission.deleteMany();
  await prisma.projectAccess.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.analysis.deleteMany();
  await prisma.project.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.role.deleteMany();
  await prisma.user.deleteMany();
};

resetDatabase()
  .catch((error) => {
    console.error("Erreur lors de la réinitialisation :", error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
