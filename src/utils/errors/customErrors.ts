import { StatusCode } from "hono/utils/http-status";

export class AppError extends Error {
  statusCode: StatusCode;

  constructor(message: string, statusCode: StatusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

export class AuthError extends AppError {
  constructor(message = "Auth error") {
    super(message, 401);
  }
}

export class RouteError extends AppError {
  constructor(message = "Route not found") {
    super(message, 404);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden acces") {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not found data") {
    super(message, 404);
  }
}

export class ValidationError extends AppError {
  constructor(message = "Invalid data") {
    super(message, 400);
  }
}

export class DatabaseError extends AppError {
  constructor(message = "Error from database") {
    super(message, 500);
  }
}
