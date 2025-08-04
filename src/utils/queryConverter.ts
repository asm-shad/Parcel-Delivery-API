import { ParsedQs } from "qs";

export const convertQuery = (query: ParsedQs): Record<string, string> => {
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(query)) {
    if (typeof value === "string") {
      result[key] = value;
    } else if (Array.isArray(value)) {
      // Handle array values by joining them with commas
      result[key] = value.map((v) => String(v)).join(",");
    } else if (value !== null && value !== undefined) {
      result[key] = String(value);
    }
  }

  return result;
};
