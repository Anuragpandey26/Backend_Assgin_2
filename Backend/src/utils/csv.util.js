import { Parser } from "json2csv";

/**
 * Standard CSV Export Utility
 * Converts a list of records into a CSV string.
 */

export const generateCsv = (data, fields = []) => {
  try {
    const opts = { fields };
    const parser = new Parser(opts);
    const csv = parser.parse(data);
    return csv;
  } catch (err) {
    console.error("CSV Generation Failed:", err);
    throw new Error("Failed to generate CSV report");
  }
};
