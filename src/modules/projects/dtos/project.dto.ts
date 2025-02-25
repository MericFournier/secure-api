import { ProjectNameType, UserIdType, UsernameType, ProjectCreatedByType } from "utils/types/prisma-types.js";

export interface CreateProjectDTO {
  name: ProjectNameType;
  projectAccess?: UserIdType[];
}

export interface ProjectResponseDTO {
  id: UserIdType;
  name: UsernameType;
  createdBy?: ProjectCreatedByType;
  projectAccess?: UserIdType[];
}