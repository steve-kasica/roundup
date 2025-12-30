/**
 * @fileoverview Barrel export for Alert types and factories.
 * @module slices/alertsSlice/Alerts
 *
 * Re-exports severity constants, base Alert factory, and specific error types.
 *
 * @example
 * import { SEVERITY_ERROR, SEVERITY_WARNING, Alert } from './Alerts';
 */
export const SEVERITY_ERROR = "error";
export const SEVERITY_WARNING = "warning";

export * from "./Alert";
export * from "./Errors";
