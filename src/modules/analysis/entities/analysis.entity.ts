import { AnalysisResponseDTO } from "../dtos/analysis.dto.js";
import {
  AnalysisIdType,
  AnalysisNameType,
  AnalysisProjectIdType,
  AnalysisCreatedByType,
} from "utils/types/prisma-types.js";
import { ValidationError } from "../../../utils/errors/customErrors.js";


export class Analysis {
  constructor(
    public id: AnalysisIdType,
    public name: AnalysisNameType,
    public projectId?: AnalysisProjectIdType,
    public createdBy?: AnalysisCreatedByType,
  ) {
    if (!id || id <= 0) throw new ValidationError("Invalid analysis ID");
    if (!name || name.trim() === "")
      throw new ValidationError("Invalid analysis name");
  }

  toDTO(options?: {
    includeProjectId?: boolean;
    includeCreatedBy?: boolean;
  }): AnalysisResponseDTO {
    return {
      id: this.id,
      name: this.name,
      ...(options?.includeProjectId && this.projectId
        ? { projectId: this.projectId }
        : {}),
      ...(options?.includeCreatedBy && this.createdBy
        ? { createdBy: this.createdBy }
        : {}),
    };
  }
}
