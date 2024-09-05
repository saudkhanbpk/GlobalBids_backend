import { validateEmail } from "./email-validate.js";

export const signUpValidate = (data) => {
  const errors = {};

  if (!data?.email) {
    errors.email = "Email is required";
  } else if (!validateEmail(data?.email)) {
    errors.email = "Please provide a valid email address";
  }

  const validRoles = ["owner", "contractor", "guest", "admin"];
  if (!data?.role) {
    errors.workRole = "Work role is required";
  } else if (!validRoles.includes(data?.role)) {
    errors.workRole = `Work role must be one of the following: ${validRoles.join(
      ", "
    )}`;
  }

  if (!data?.password) {
    errors.password = "Password is required";
  } else if (data?.password?.length < 8) {
    errors.password = "Password must be at least 8 characters long";
  }

  return Object.keys(errors).length > 0 ? errors : null;
};
