import type { SQL } from "drizzle-orm";
import { sql } from "drizzle-orm";

export const createLikePattern = (query: string): string => {
  return `%${query.toLowerCase()}%`;
};

export const buildSearchCondition = (
  searchFields: SQL[],
  searchQuery: string,
): SQL | null => {
  if (!searchQuery) return null;

  const pattern = createLikePattern(searchQuery);
  if (searchFields.length === 0) return null;

  return sql`(${searchFields.reduce((acc, field, index) => {
    if (index === 0) {
      return sql`LOWER(${field}) LIKE ${pattern}`;
    }
    return sql`${acc} OR LOWER(${field}) LIKE ${pattern}`;
  })})`;
};

export const buildSortCondition = (
  sortBy: string,
  sortOrder: "asc" | "desc",
  defaultSort: SQL,
): SQL => {
  // Prevent SQL injection by validating sortBy
  const validSortFields = new Set([
    "createdAt",
    "updatedAt",
    "title",
    "status",
    "name",
    "email",
  ]);

  if (!validSortFields.has(sortBy)) {
    return defaultSort;
  }

  // This is a simplified version - in production use proper column references
  return defaultSort;
};

export interface ExportOptions {
  filename: string;
  format: "csv" | "json";
  columns: string[];
}

export const convertToCSV = (
  data: Record<string, unknown>[],
  columns: string[],
): string => {
  if (data.length === 0) return "";

  const headers = columns.join(",");
  const rows = data.map((row) =>
    columns
      .map((col) => {
        const value = row[col];
        if (value === null || value === undefined) return "";
        const stringValue = String(value);
        // Escape quotes and wrap in quotes if contains comma
        if (stringValue.includes(",") || stringValue.includes('"')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      })
      .join(","),
  );

  return [headers, ...rows].join("\n");
};

export const convertToJSON = (data: Record<string, unknown>[]): string => {
  return JSON.stringify(data, null, 2);
};
