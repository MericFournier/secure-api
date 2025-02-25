import { z } from "zod";
import { Project } from "../../modules/projects/entities/project.entity.js";
import { ForbiddenError } from "../errors/customErrors.js";
import {
  IsAdminType,
  UserIdType,
} from "../../utils/types/prisma-types.js";

const projectAccessEntrySchema = z.union([
  z.number(),
  z.object({ userId: z.number() }),
]);

const projectSchema = z.object({
  id: z.number(),
  createdBy: z.number(),
  projectAccess: z.array(projectAccessEntrySchema).optional(),
});

/**
 * Vérifie que l'utilisateur dispose des permissions nécessaires pour accéder ou modifier un projet.
 *
 * Cette fonction vérifie si l'utilisateur (userId) est autorisé à accéder à un projet donné.
 * - Si l'utilisateur est un administrateur (isAdmin = true), l'accès est immédiatement autorisé.
 * - Sinon, le projet est validé via `projectSchema.parse` pour s'assurer de sa conformité.
 * - L'utilisateur est autorisé s'il est l'auteur du projet (createdBy) ou s'il figure dans la liste d'accès du projet (projectAccess).
 * - Dans le cas d'une opération d'écriture (isWriting = true), seul l'auteur du projet est autorisé.
 *
 * @param {Project} project - L'objet projet sur lequel vérifier les permissions.
 * @param {UserIdType} userId - L'identifiant de l'utilisateur effectuant l'action.
 * @param {IsAdminType} isAdmin - Indique si l'utilisateur dispose des privilèges administrateur.
 * @param {boolean} isWriting - Indique si l'opération en cours est une écriture (modification) du projet.
 * @returns {void} Ne retourne aucune valeur si l'utilisateur est autorisé.
 * @throws {ForbiddenError} Si l'utilisateur n'est pas autorisé à accéder ou modifier le projet.
 */

export const assertUserPermissionOnProject = (
  project: Project,
  userId: UserIdType,
  isAdmin: IsAdminType,
  isWriting: boolean,
): void => {
  if (isAdmin) return;
  const parsedProject = projectSchema.parse(project);
  const isAuthor = parsedProject.createdBy === userId;
  const isAuthorized = parsedProject.projectAccess?.some((entry) =>
    typeof entry === "number" ? entry === userId : entry.userId === userId,
  );
  if (!(isAuthor || isAuthorized) || (isWriting && !isAuthor)) {
    throw new ForbiddenError(`Unauthorized access (ID: ${parsedProject.id})`);
  }
};

