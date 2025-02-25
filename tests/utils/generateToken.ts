import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { UserIdType } from "utils/types/prisma-types.js";

dotenv.config();

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "null";

if (!JWT_SECRET) {
  process.exit(1);
}

export const generateToken = async (userId: UserIdType): Promise<string | void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { userRole: { include: { role: true } } },
    });
    if (!user) {
      process.exit(1);
    }
    const token = jwt.sign({ userId }, JWT_SECRET);
    console.log(token)
    return token;
  } catch (error) {
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};


const args = process.argv.slice(2);
const userId = parseInt(args[0], 10);
if (isNaN(userId)) {
  process.exit(1);
}
generateToken(userId);
