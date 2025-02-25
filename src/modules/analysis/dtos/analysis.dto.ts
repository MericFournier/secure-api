import {
  AnalysisNameType,
  ProjectIdType,
  AnalysisIdType,
  AnalysisCreatedByType,
} from "../../../utils/types/prisma-types.js";

export interface CreateAnalysisDTO {
  name: AnalysisNameType;
  projectId: ProjectIdType;
}

export interface AnalysisResponseDTO {
  id: AnalysisIdType;
  name: AnalysisNameType;
  projectId?: ProjectIdType;
  createdBy?: AnalysisCreatedByType;
}
