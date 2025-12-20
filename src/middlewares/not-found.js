import { NotFoundException } from "#lib/exceptions";

export function notFoundHandler(req, res, next***REMOVED*** {
  throw new NotFoundException(`Route ${req.method} ${req.path} not found`***REMOVED***;
}

