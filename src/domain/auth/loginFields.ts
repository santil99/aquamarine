export type LoginFieldError = "emailRequired" | "emailInvalid" | "passwordRequired";

export interface LoginFieldErrors {
  email?: LoginFieldError;
  password?: LoginFieldError;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLoginFields(email: string, password: string): LoginFieldErrors {
  const errors: LoginFieldErrors = {};
  const trimmedEmail = email.trim();

  if (!trimmedEmail) {
    errors.email = "emailRequired";
  } else if (!EMAIL_PATTERN.test(trimmedEmail)) {
    errors.email = "emailInvalid";
  }

  if (!password) {
    errors.password = "passwordRequired";
  }

  return errors;
}

export function hasLoginFieldErrors(errors: LoginFieldErrors): boolean {
  return Object.keys(errors).length > 0;
}
