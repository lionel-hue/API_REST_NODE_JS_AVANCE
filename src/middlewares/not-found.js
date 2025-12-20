import { NotFoundException } from "../lib/exceptions.js";

export function notFoundHandler(req, res, next) {
  throw new NotFoundException(`Route ${req.method} ${req.path} not found`);
}
