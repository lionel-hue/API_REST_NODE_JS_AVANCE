import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder(***REMOVED***.encode(process.env.JWT_SECRET***REMOVED***;
const alg = "HS256";

export async function signToken(payload, expiresIn = "7d"***REMOVED*** {
  return new SignJWT(payload***REMOVED***
    .setProtectedHeader({ alg }***REMOVED***
    .setIssuedAt(***REMOVED***
    .setExpirationTime(expiresIn***REMOVED***
    .sign(secret***REMOVED***;
}

export async function verifyToken(token***REMOVED*** {
  const { payload } = await jwtVerify(token, secret***REMOVED***;
  return payload;
}
