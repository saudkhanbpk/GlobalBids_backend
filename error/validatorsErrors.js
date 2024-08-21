import { AppError } from "./AppError.js";

export class EmailValidationError extends AppError {
  constructor(message = "Invalid email address") {
    super(message, 400, true, "warn");
  }
}
