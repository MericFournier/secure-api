import prisma from "../../prisma/prisma.js";
import { app } from "../../src/index.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
const dbSetup = require("./db-setup.json");

const userRoleToken = {
  admin: dbSetup.users[0].id,
  manager: dbSetup.users[1].id,
  reader: dbSetup.users[2].id,
};
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "test";

if (!JWT_SECRET) {
  throw new Error("No JWT_SECRET in .env");
}

let test_tokens: any;

export const getTestToken = async (userId: number): Promise<string> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { userRole: { include: { role: true } } },
  });

  if (!user) {
    throw new Error(`❌ ERREUR: Aucun utilisateur trouvé avec l'ID ${userId}`);
  }

  const token = jwt.sign({ userId, isAdmin: user.isAdmin }, JWT_SECRET, {
    expiresIn: "1h",
  });
  return token;
};


beforeAll(async () => {
  process.env.DATABASE_URL = "file:./prisma/tests/database/test.sqlite3";
  await prisma.$connect();
  await prisma.projectAccess.deleteMany();
  await prisma.analysis.deleteMany();
  await prisma.project.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.rolePermission.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();
  await prisma.role.createMany({
    data: dbSetup.roles,
  });
  await prisma.user.createMany({
    data: dbSetup.users,
  });
  await prisma.userRole.createMany({
    data: dbSetup.userRoles,
  });
  await prisma.project.createMany({
    data: dbSetup.project,
  });
  await prisma.analysis.createMany({
    data: dbSetup.analyses,
  });
  await prisma.projectAccess.createMany({
    data: dbSetup.projectAccess,
  });
  test_tokens = {};
  const tokenPromises = dbSetup.users.map(async (user: any) => {
    const userToken = await getTestToken(user.id);
    test_tokens[user.id] = userToken;
  });
  await Promise.all(tokenPromises);
});

afterAll(async () => {
  await prisma.$disconnect();
});

export { prisma, app, test_tokens, userRoleToken };
