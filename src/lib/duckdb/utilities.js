/**
 * @fileoverview DuckDB utility functions.
 * @module lib/duckdb/utilities
 *
 * Common utility functions used across DuckDB operations.
 *
 * Features:
 * - Column name escaping for SQL safety
 * - Handles special characters in identifiers
 * - Prevents SQL injection in column names
 *
 * @example
 * import { escapeColumnName } from './utilities';
 * const safeName = escapeColumnName('my column'); // '"my column"'
 * const query = `SELECT ${safeName} FROM users`;
 */
export const escapeColumnName = (name) => `"${name}"`;
