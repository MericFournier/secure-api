import { z } from "zod";

export const getProjectsSchema = z.object({
  userId: z.number({ invalid_type_error: "wrong userId" }).int(),
  isAdmin: z.boolean({ invalid_type_error: "wrong admin status" }),
});

export const getProjectSchema = z.object({
  projectId: z.number({ invalid_type_error: "wrong projectId" }).int(),
  userId: z.number({ invalid_type_error: "wrong userId" }).int(),
  isAdmin: z.boolean({ invalid_type_error: "wrong admin status" }),
});

export const findProjectByIdSchema = z.object({
  projectId: z.number({ invalid_type_error: "wrong projectId" }).int(),
});

export const createProjectSchema = z.object({
  name: z.string().min(1, { message: "wrong project name" }),
  projectAccess: z.array(z.number().int()).optional(),
  userId: z.number({ invalid_type_error: "wrong userId" }).int(),
  userRole: z.string({message: "wrong user role name"}),
});
