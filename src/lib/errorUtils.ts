/**
 * Centralized error utility for logging and mapping error messages.
 */

export const logError = (error: Error, context?: string) => {
  // In a production app, this could send errors to Sentry or another service.
  console.error(`[Error][${context || "Global"}]:`, error);
};

export const getErrorMessage = (error: any): string => {
  if (typeof error === "string") return error;
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.message) return error.message;
  return "An unexpected error occurred. Please try again.";
};

export const handleApiError = (error: any, context?: string) => {
  const message = getErrorMessage(error);
  logError(error, context);
  // Optional: add a global toast notification if needed here
  return message;
};
