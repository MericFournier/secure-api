import { ValidationError } from "../errors/customErrors.js";
import { z } from "zod";

export const ZodValidateData = <T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): T => {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ValidationError(result.error.errors[0]?.message);
  }
  return result.data;
};
