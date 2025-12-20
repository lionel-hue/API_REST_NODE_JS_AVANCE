import { UnauthorizedException } from "#lib/exceptions";
import { verifyToken } from "#lib/jwt";
import { logger } from "#lib/logger";

export async function auth(req, res, next) {
  const bearerToken = req.headers["authorization"];
  if (!bearerToken) {
    throw new UnauthorizedException();
  }

  const tokenPart = bearerToken.split(" ");
  const token = tokenPart[1];

  if (await verifyToken(token)) {
    next();
  } else {
    throw new UnauthorizedException();
  }
}
