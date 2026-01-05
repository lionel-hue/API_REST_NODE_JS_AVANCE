import { NotFoundException } from "#lib/exceptions";

export function notFoundHandler(req, res, next) {
  throw new NotFoundException(`Route ${req.method} ${req.path} not found`);
}

