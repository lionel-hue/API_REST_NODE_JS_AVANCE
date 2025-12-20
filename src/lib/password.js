import argon2 from "argon2";

export async function hashPassword(password***REMOVED*** {
  return argon2.hash(password***REMOVED***;
}

export async function verifyPassword(hash, password***REMOVED*** {
  return argon2.verify(hash, password***REMOVED***;
}