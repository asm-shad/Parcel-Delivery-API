"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertQuery = void 0;
const convertQuery = (query) => {
    const result = {};
    for (const [key, value] of Object.entries(query)) {
        if (typeof value === "string") {
            result[key] = value;
        }
        else if (Array.isArray(value)) {
            // Handle array values by joining them with commas
            result[key] = value.map((v) => String(v)).join(",");
        }
        else if (value !== null && value !== undefined) {
            result[key] = String(value);
        }
    }
    return result;
};
exports.convertQuery = convertQuery;
