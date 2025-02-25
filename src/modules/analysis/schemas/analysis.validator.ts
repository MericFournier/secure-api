import { z } from "zod";

export const getAnalysesByProjectSchema = z.object({
  projectId: z.number({ invalid_type_error: "projectId doit être un nombre" }).int(),
  userId: z.number({ invalid_type_error: "userId doit être un nombre" }).int(),
  isAdmin: z.boolean({ invalid_type_error: "isAdmin doit être un boolean" }),
});

export const getAnalysisByProjectSchema = z.object({
  projectId: z.number({ invalid_type_error: "projectId doit être un nombre" }).int(),
  analysisId: z.number({ invalid_type_error: "analysisId doit être un nombre" }).int(),
  userId: z.number({ invalid_type_error: "userId doit être un nombre" }).int(),
  isAdmin: z.boolean({ invalid_type_error: "isAdmin doit être un boolean" }),
});

export const createAnalysisSchema = z.object({
  name: z.string().min(1, { message: "Le nom de l'analyse est requis" }),
  projectId: z.number({ invalid_type_error: "projectId doit être un nombre" }).int(),
  userId: z.number({ invalid_type_error: "userId doit être un nombre" }).int(),
  isAdmin: z.boolean({ invalid_type_error: "isAdmin doit être un boolean" }),
  userRole: z.string({message: "User role doit être une string"}),
});
