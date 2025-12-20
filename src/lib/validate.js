import { ValidationException } from "#lib/exceptions";

/**
 * Cette fonction vérifie que les données reçues respectent les règles prévues.
 * Si ce n'est pas le cas, elle lève une erreur (Exception***REMOVED*** que le serveur catchera.
 */
export function validateData(schema, data***REMOVED*** {
  const result = schema.safeParse(data***REMOVED***;

  if (!result.success***REMOVED*** {
    throw new ValidationException(result.error.flatten(***REMOVED***.fieldErrors***REMOVED***;
  }

  return result.data;
}
