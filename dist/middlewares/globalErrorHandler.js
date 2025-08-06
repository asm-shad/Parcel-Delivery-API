"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = void 0;
const env_1 = require("../config/env");
const AppError_1 = __importDefault(require("../errorHelpers/AppError"));
const handleDuplicateError_1 = require("../helpers/handleDuplicateError");
const handleCastError_1 = require("../helpers/handleCastError");
const handleZodError_1 = require("../helpers/handleZodError");
const handleValidationError_1 = require("../helpers/handleValidationError");
/**
 * Global error handling middleware for Express.
 * Catches and processes known error types and sends a structured response.
 */
const globalErrorHandler = (err, req, res, next) => {
    var _a, _b;
    if (env_1.envVars.NODE_ENV === "development") {
        console.log(err);
    }
    // Default error response values
    let statusCode = 500;
    let message = "Something went wrong!!";
    let errorSources = [];
    // Handle MongoDB duplicate key error (e.g., unique constraint violation)
    if (err.code === 11000) {
        const simplifiedError = (0, handleDuplicateError_1.handleDuplicateError)(err);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
    }
    // Handle invalid MongoDB ObjectId error (CastError)
    else if (err.name === "CastError") {
        const simplifiedError = (0, handleCastError_1.handleCastError)(err);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
    }
    // Handle Zod validation errors
    else if (err.name === "ZodError") {
        const simplifiedError = (0, handleZodError_1.handleZodError)(err);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
        errorSources = (_a = simplifiedError.errorSources) !== null && _a !== void 0 ? _a : [];
    }
    // Handle Mongoose schema validation errors
    else if (err.name === "ValidationError") {
        const simplifiedError = (0, handleValidationError_1.handleValidationError)(err);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
        errorSources = (_b = simplifiedError.errorSources) !== null && _b !== void 0 ? _b : [];
    }
    //   Handle custom application-defined errors
    else if (err instanceof AppError_1.default) {
        statusCode = err.statusCode;
        message = err.message;
    }
    // Handle all other built-in JavaScript errors
    else if (err instanceof Error) {
        statusCode = 500;
        message = err.message;
    }
    // Send structured error response
    res.status(statusCode).json({
        success: false,
        message,
        errorSources: errorSources.length ? errorSources : undefined, // Only include if available
        err: env_1.envVars.NODE_ENV === "development" ? err : null,
        stack: env_1.envVars.NODE_ENV === "development" ? err.stack : null,
    });
};
exports.globalErrorHandler = globalErrorHandler;
