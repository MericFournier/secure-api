import { ProjectResponseDTO } from "../dtos/project.dto.js";
import {
  ProjectNameType,
  ProjectIdType,
  ProjectCreatedByType,
  ProjectAccessProjectIdType,
  ProjectAccessUserIdType,
} from "utils/types/prisma-types.js";

export class Project {
  constructor(
    public id: ProjectIdType,
    public name: ProjectNameType,
    public createdBy?: ProjectCreatedByType,
    public projectAccess?: {
      projectId: ProjectAccessProjectIdType;
      userId: ProjectAccessUserIdType;
    }[],
  ) {}

  toDTO(options?: {
    includeCreatedBy?: boolean;
    includeProjectAccess?: boolean;
  }): ProjectResponseDTO {
    return {
      id: this.id,
      name: this.name,
      ...(options?.includeCreatedBy &&
        this.createdBy && { createdBy: this.createdBy }),
      ...(options?.includeProjectAccess &&
        this.projectAccess && {
          projectAccess: this.projectAccess.map((access) => access.userId),
        }),
    };
  }
}
