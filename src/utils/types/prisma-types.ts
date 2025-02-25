import prisma from "../../../prisma/prisma.js";

export type PrismaUser = Awaited<ReturnType<typeof prisma.user.findMany>>[number];
export type UserIdType = PrismaUser["id"];
export type UsernameType = PrismaUser["username"];
export type EmailType = PrismaUser["email"];
export type IsAdminType = PrismaUser["isAdmin"];
export type UserCreatedAtType = PrismaUser["createdAt"];
export type UserUpdatedAtType = PrismaUser["updatedAt"];

export type PrismaRole = Awaited<ReturnType<typeof prisma.role.findMany>>[number];
export type RoleIdType = PrismaRole["id"];
export type RoleNameType = PrismaRole["name"];

export type PrismaPermission = Awaited<ReturnType<typeof prisma.permission.findMany>>[number];
export type PermissionIdType = PrismaPermission["id"];
export type PermissionNameType = PrismaPermission["name"];
export type PermissionCategoryType = PrismaPermission["category"];

export type PrismaUserRole = Awaited<ReturnType<typeof prisma.userRole.findMany>>[number];
export type UserRoleUserIdType = PrismaUserRole["userId"];
export type UserRoleRoleIdType = PrismaUserRole["roleId"];

export type PrismaProject = Awaited<ReturnType<typeof prisma.project.findMany>>[number];
export type ProjectIdType = PrismaProject["id"];
export type ProjectNameType = PrismaProject["name"];
export type ProjectCreatedByType = PrismaProject["createdBy"];
export type ProjectCreatedAtType = PrismaProject["createdAt"];
export type ProjectUpdatedAtType = PrismaProject["updatedAt"];

export type PrismaAnalysis = Awaited<ReturnType<typeof prisma.analysis.findMany>>[number];
export type AnalysisIdType = PrismaAnalysis["id"];
export type AnalysisNameType = PrismaAnalysis["name"];
export type AnalysisProjectIdType = PrismaAnalysis["projectId"];
export type AnalysisCreatedByType = PrismaAnalysis["createdBy"];
export type AnalysisCreatedAtType = PrismaAnalysis["createdAt"];
export type AnalysisUpdatedAtType = PrismaAnalysis["updatedAt"];

export type PrismaProjectAccess = Awaited<ReturnType<typeof prisma.projectAccess.findMany>>[number];
export type ProjectAccessUserIdType = PrismaProjectAccess["userId"];
export type ProjectAccessProjectIdType = PrismaProjectAccess["projectId"];

export type PrismaRolePermission = Awaited<ReturnType<typeof prisma.rolePermission.findMany>>[number];
export type RolePermissionRoleIdType = PrismaRolePermission["roleId"];
export type RolePermissionPermissionIdType = PrismaRolePermission["permissionId"];