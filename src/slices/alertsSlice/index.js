/**
 * @fileoverview Barrel export for alertsSlice module.
 * @module slices/alertsSlice
 *
 * Re-exports all alert-related actions, selectors, and alert type factories.
 *
 * @example
 * import { addAlerts, selectAlertIdsBySourceId, SEVERITY_ERROR } from './alertsSlice';
 */
export * from "./alertsSlice.js"; // exports all actions
export * from "./Alerts";
export * from "./selectors.js";
import reducer from "./alertsSlice.js";

export default reducer;
