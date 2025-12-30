/**
 * @fileoverview Base Alert factory function.
 * @module slices/alertsSlice/Alerts/Alert
 *
 * Factory function for creating alert objects with consistent structure.
 * Alerts are used to communicate validation errors and warnings to users.
 *
 * Features:
 * - Auto-generates unique IDs from sourceId and code
 * - Timestamps for alert creation
 * - Supports silencing and pass/fail states
 * - Custom messages per alert instance
 *
 * @example
 * import { Alert } from './Alert';
 * const alert = Alert('MISSING_KEY', 'Missing Key', 'Description...', 'error', 'op_1');
 */
export const Alert = (
  code,
  name,
  description,
  severity,

  sourceId,
  isPassing = false,
  message = null
) => ({
  // Auto-generate unique ID for each alert
  timeStamp: Date.now(),

  code,
  name,
  description,
  severity,

  sourceId,
  isPassing,
  isSilenced: false,
  message,
  id: [sourceId, code].join("_"),
});
