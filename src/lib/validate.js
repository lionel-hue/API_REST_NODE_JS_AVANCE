import { ValidationException } from "#lib/exceptions";

/**
 * Cette fonction vérifie que les données reçues respectent les règles prévues.
 * Si ce n'est pas le cas, elle lève une erreur (Exception) que le serveur catchera.
 */
export function validateData(schema, data) {
  const result = schema.safeParse(data);

  if (!result.success) {
    throw new ValidationException(result.error.flatten().fieldErrors);
  }

  return result.data;
}
