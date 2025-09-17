class AppError extends Error {
  //as we extended Error the public properties of Error (name, message and stack) can be used.
  public statusCode: number;

  constructor(statusCode: number, message: string, stack = "") {
    super(message); // throw new Error("Something went wrong");
    this.statusCode = statusCode;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default AppError;
