import { Prisma } from "@prisma/client";
import { UserIdType } from "../../utils/types/prisma-types.js";
import { User, Role } from '@prisma/client';
import { ValidationError } from "../../utils/errors/customErrors.js";

type ExtendedUser = User & {
  userRole: {
    role: Role;
  } | null;
};

/**
 * Vérifie que tous les utilisateurs spécifiés existent dans la base de données.
 *
 * Cette fonction prend un client de transaction Prisma et un tableau d'identifiants d'utilisateurs.
 * Elle interroge la base de données pour récupérer les utilisateurs correspondants et vérifie que
 * tous les identifiants fournis existent. Si certains identifiants ne sont pas trouvés, une
 * ValidationError est levée avec la liste des identifiants manquants.
 *
 * @param {Prisma.TransactionClient} tx - Le client de transaction Prisma utilisé pour exécuter la requête.
 * @param {UserIdType[]} userIds - Un tableau contenant les identifiants des utilisateurs à vérifier.
 * @returns {Promise<ExtendedUser[]>} Une promesse qui se résout avec le tableau des utilisateurs étendus (ExtendedUser) trouvés.
 * @throws {ValidationError} Si un ou plusieurs utilisateurs n'existent pas.
 */

export const assertUsersExist = async (
  tx: Prisma.TransactionClient,
  userIds: UserIdType[],
): Promise<ExtendedUser[]> => {
  const existingUsers = await tx.user.findMany({
    where: { id: { in: userIds } },
    include: { userRole: { include: { role: true } } },
  });
  const existingIds = existingUsers.map(user => user.id);
  const missingIds = userIds.filter(id => !existingIds.includes(id));
  if (missingIds.length) {
    throw new ValidationError(
      `Following users doesn't exist: ${missingIds.join(", ")}`,
    );
  }
  return existingUsers as ExtendedUser[];
};