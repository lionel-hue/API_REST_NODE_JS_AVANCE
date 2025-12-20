import { UnauthorizedException } from "#lib/exceptions";
import { verifyToken } from "#lib/jwt";
import { logger } from "#lib/logger";

export async function auth(req, res, next***REMOVED*** {
  const bearerToken = req.headers["authorization"];
  if (!bearerToken***REMOVED*** {
    throw new UnauthorizedException(***REMOVED***;
  }

  const tokenPart = bearerToken.split(" "***REMOVED***;
  const token = tokenPart[1];

  if (await verifyToken(token***REMOVED******REMOVED*** {
    next(***REMOVED***;
  } else {
    throw new UnauthorizedException(***REMOVED***;
  }
}
