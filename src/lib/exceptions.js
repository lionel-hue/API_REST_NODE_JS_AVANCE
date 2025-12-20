export class HttpException extends Error {
  constructor(statusCode, message, details = null***REMOVED*** {
    super(message***REMOVED***;
    this.statusCode = statusCode;
    this.details = details;
    this.name = this.constructor.name;
  }
}

export class BadRequestException extends HttpException {
  constructor(message = "Bad Request", details = null***REMOVED*** {
    super(400, message, details***REMOVED***;
  }
}

export class UnauthorizedException extends HttpException {
  constructor(message = "Unauthorized"***REMOVED*** {
    super(401, message***REMOVED***;
  }
}

export class ForbiddenException extends HttpException {
  constructor(message = "Forbidden"***REMOVED*** {
    super(403, message***REMOVED***;
  }
}

export class NotFoundException extends HttpException {
  constructor(message = "Not Found"***REMOVED*** {
    super(404, message***REMOVED***;
  }
}

export class ConflictException extends HttpException {
  constructor(message = "Conflict"***REMOVED*** {
    super(409, message***REMOVED***;
  }
}

export class ValidationException extends HttpException {
  constructor(errors***REMOVED*** {
    super(400, "Validation Failed", errors***REMOVED***;
  }
}

