class ApiError extends Error {
  constructor(
    statusCode,
    message = "Something went wrong",
    errors = [],
    stack = ""
  ) {
    super(message);

    this.statusCode = statusCode;
    this.data = null;
    this.message = message;
    this.success = false;
    this.errors = errors; // FIXED (was: errors not defined)

    if (stack) {
      this.stack = stack; // FIXED (was: statck)
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
