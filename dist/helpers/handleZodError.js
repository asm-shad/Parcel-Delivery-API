"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleZodError = void 0;
const handleZodError = (err) => {
    const errorSources = [];
    err.issues.forEach((issue) => {
        errorSources.push({
            path: issue.path[issue.path.length - 1],
            message: "Error In " + issue.path.slice().reverse().join("inside "),
        });
    });
    return {
        statusCode: 400,
        message: "Zod Error",
        errorSources,
    };
};
exports.handleZodError = handleZodError;
