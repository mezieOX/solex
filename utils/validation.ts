/**
 * Validation Schemas using Yup
 * Centralized validation schemas for forms
 */

import * as yup from "yup";

/**
 * Email validation regex
 */
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Phone validation regex (supports international formats)
 */
const phoneRegex = /^[\d\s\-\+\(\)]+$/;

/**
 * Signup validation schema
 */
export const signupSchema = yup.object().shape({
  name: yup
    .string()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must not exceed 50 characters")
    .trim(),
  email: yup
    .string()
    .required("Email is required")
    .email("Please enter a valid email address")
    .matches(emailRegex, "Please enter a valid email address")
    .trim()
    .lowercase(),
  phone: yup
    .string()
    .required("Phone number is required")
    .matches(phoneRegex, "Please enter a valid phone number")
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number must not exceed 15 digits")
    .trim(),
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .max(50, "Password must not exceed 50 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  confirmPassword: yup
    .string()
    .required("Please confirm your password")
    .oneOf([yup.ref("password")], "Passwords do not match"),
  dateOfBirth: yup
    .date()
    .required("Date of birth is required")
    .max(new Date(), "Date of birth cannot be in the future")
    .test(
      "age",
      "You must be at least 18 years old",
      function (value) {
        if (!value) return false;
        const today = new Date();
        const birthDate = new Date(value);
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (
          monthDiff < 0 ||
          (monthDiff === 0 && today.getDate() < birthDate.getDate())
        ) {
          return age - 1 >= 18;
        }
        return age >= 18;
      }
    ),
  gender: yup
    .string()
    .required("Gender is required")
    .oneOf(["male", "female", "other"], "Please select a valid gender"),
});

/**
 * Login validation schema
 */
export const loginSchema = yup.object().shape({
  email: yup
    .string()
    .required("Email is required")
    .email("Please enter a valid email address")
    .matches(emailRegex, "Please enter a valid email address")
    .trim()
    .lowercase(),
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
});

/**
 * Email verification schema
 */
export const emailVerificationSchema = yup.object().shape({
  email: yup
    .string()
    .required("Email is required")
    .email("Please enter a valid email address")
    .matches(emailRegex, "Please enter a valid email address")
    .trim()
    .lowercase(),
  code: yup
    .string()
    .required("Verification code is required")
    .length(6, "Verification code must be 6 digits")
    .matches(/^\d+$/, "Verification code must contain only numbers"),
});

/**
 * Forgot password schema
 */
export const forgotPasswordSchema = yup.object().shape({
  email: yup
    .string()
    .required("Email is required")
    .email("Please enter a valid email address")
    .matches(emailRegex, "Please enter a valid email address")
    .trim()
    .lowercase(),
});

/**
 * Reset password schema
 */
export const resetPasswordSchema = yup.object().shape({
  email: yup
    .string()
    .required("Email is required")
    .email("Please enter a valid email address")
    .matches(emailRegex, "Please enter a valid email address")
    .trim()
    .lowercase(),
  code: yup
    .string()
    .required("Reset code is required")
    .length(6, "Reset code must be 6 digits")
    .matches(/^\d+$/, "Reset code must contain only numbers"),
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .max(50, "Password must not exceed 50 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  confirmPassword: yup
    .string()
    .required("Please confirm your password")
    .oneOf([yup.ref("password")], "Passwords do not match"),
});

/**
 * Change password schema (in-app, no email/code required)
 */
export const changePasswordSchema = yup.object().shape({
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .max(50, "Password must not exceed 50 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  confirmPassword: yup
    .string()
    .required("Please confirm your password")
    .oneOf([yup.ref("password")], "Passwords do not match"),
});

/**
 * Create password schema
 */
export const createPasswordSchema = yup.object().shape({
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .max(50, "Password must not exceed 50 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  confirmPassword: yup
    .string()
    .required("Please confirm your password")
    .oneOf([yup.ref("password")], "Passwords do not match"),
});

/**
 * NIN (National Identification Number) validation schema
 */
export const ninSchema = yup.object().shape({
  nin: yup
    .string()
    .required("NIN is required")
    .matches(/^\d{11}$/, "NIN must be exactly 11 digits")
    .trim(),
});

/**
 * Helper function to format Yup validation errors
 */
export const formatValidationError = (
  error: yup.ValidationError
): Record<string, string> => {
  const formattedErrors: Record<string, string> = {};

  if (error.inner && error.inner.length > 0) {
    error.inner.forEach((err) => {
      if (err.path) {
        formattedErrors[err.path] = err.message;
      }
    });
  } else if (error.path) {
    formattedErrors[error.path] = error.message;
  }

  return formattedErrors;
};
