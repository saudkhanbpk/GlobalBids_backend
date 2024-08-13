// customErrors.js
class AppError extends Error {
  constructor(message, statusCode, isOperational = true, logLevel = "error") {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational; 
    this.logLevel = logLevel; 
    this.timestamp = new Date().toISOString();
    Error.captureStackTrace(this, this.constructor);
  }


  logError() {
    if (process.env.NODE_ENV !== "production") {
      console[this.logLevel](
        `${this.timestamp} - ${this.logLevel.toUpperCase()}: ${this.message}`
      );
      console[this.logLevel](this.stack);
    } else {

      console.error(`${this.timestamp} - ERROR: ${this.message}`);
    }
  }

  // Method to categorize error type (optional)
  getErrorType() {
    if (this.statusCode >= 500) return "Server Error";
    if (this.statusCode >= 400) return "Client Error";
    return "Unknown Error";
  }
}

// Not Found Error
class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404, true, "warn");
  }
}

// Validation Error
class ValidationError extends AppError {
  constructor(message = "Validation failed") {
    super(message, 400, true, "warn");  
  }
}

// Unauthorized Error
class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized access") {
    super(message, 401, true, "warn");
  }
}

// Internal Server Error
class InternalServerError extends AppError {
  constructor(message = "Internal server error") {
    super(message, 500, true, "error");
  }
}

// Custom Error for Specific Business Logic Failures
class BusinessLogicError extends AppError {
  constructor(message = "Business rule violation") {
    super(message, 422, true, "warn");
  }
}

export {
  AppError,
  NotFoundError,
  ValidationError,
  UnauthorizedError,
  InternalServerError,
  BusinessLogicError,
};
