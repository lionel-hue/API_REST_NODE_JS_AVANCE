import { HttpException } from "#lib/exceptions";
import { logger } from "#lib/logger";

export function errorHandler(err, req, res, next***REMOVED*** {
  if (err instanceof HttpException***REMOVED*** {
    logger.warn({ err, path: req.path }, err.message***REMOVED***;
  } else {
    logger.error({ err, path: req.path }, "Unhandled error"***REMOVED***;
  }

  if (err instanceof HttpException***REMOVED*** {
    return res.status(err.statusCode***REMOVED***.json({
      success: false,
      error: err.message,
      ...(err.details && { details: err.details }***REMOVED***,
    }***REMOVED***;
  }

  if (err.code === "P2002"***REMOVED*** {
    return res.status(409***REMOVED***.json({
      success: false,
      error: "Resource already exists",
    }***REMOVED***;
  }

  if (err.code === "P2025"***REMOVED*** {
    return res.status(404***REMOVED***.json({
      success: false,
      error: "Resource not found",
    }***REMOVED***;
  }

  if (err instanceof SyntaxError && err.status === 400***REMOVED*** {
    return res.status(400***REMOVED***.json({
      success: false,
      error: "Invalid JSON",
    }***REMOVED***;
  }

  const isProduction = process.env.NODE_ENV === "production";

  res.status(500***REMOVED***.json({
    success: false,
    error: isProduction ? "Internal Server Error" : err.message,
    ...(!isProduction && { stack: err.stack }***REMOVED***,
  }***REMOVED***;
}

