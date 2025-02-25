import { NotFoundError } from "../errors/customErrors.js";
import { ProjectIdType } from "../../utils/types/prisma-types.js";

/**
 * Vérifie qu'un projet existe en utilisant une fonction de recherche asynchrone.
 *
 * Cette fonction reçoit un identifiant de projet et une fonction de recherche qui
 * retourne une promesse résolue avec le projet correspondant ou `null` si le projet n'est pas trouvé.
 * Si aucun projet n'est trouvé, une exception `NotFoundError` est levée.
 *
 * @template T - Le type de l'objet projet retourné par la fonction de recherche.
 * @param {ProjectIdType} projectId - L'identifiant du projet à vérifier.
 * @param {(id: ProjectIdType) => Promise<T | null>} lookupFn - Fonction asynchrone qui prend l'identifiant du projet 
 *        et retourne une promesse contenant le projet correspondant ou `null` s'il n'existe pas.
 * @returns {Promise<T>} Une promesse qui se résout avec le projet trouvé.
 * @throws {NotFoundError} Si aucun projet n'est trouvé pour l'identifiant fourni.
 */

export const assertProjectExists = async <T>(
  projectId: ProjectIdType,
  lookupFn: (id: ProjectIdType) => Promise<T | null>
): Promise<T> => {
  const project = await lookupFn(projectId);
  if (!project) {
    throw new NotFoundError(`Project not found (ID: ${projectId})`);
  }
  return project;
};

