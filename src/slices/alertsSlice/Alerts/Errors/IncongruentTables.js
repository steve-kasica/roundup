/**
 * @fileoverview Incongruent tables error alert for STACK operations.
 * @module slices/alertsSlice/Alerts/Errors/IncongruentTables
 *
 * Alert triggered when child tables in a STACK operation have different
 * column counts, preventing view creation.
 *
 * @example
 * import { validateIncongruentTables } from './IncongruentTables';
 * const alert = validateIncongruentTables(operation, [5, 5, 3]);
 */
import { Alert } from "../Alert.js";
import { SEVERITY_ERROR } from "../index.js";

const code = "INCONGRUENT_TABLES";

const IncongruentTablesAlert = (sourceId, isPassing, message) =>
  Alert(
    code,
    "Incongruent Tables",
    "All child tables must have the same number of columns to create a stack view.",
    SEVERITY_ERROR,

    sourceId,
    isPassing,
    message
  );

const validateIncongruentTables = (operation, columnCounts) => {
  const allColumnCountsEqual = columnCounts.every(
    (count) => count === columnCounts[0]
  );

  return IncongruentTablesAlert(
    operation.id,
    allColumnCountsEqual,
    `Stack operation ${
      operation.name || ""
    } has incongruent child tables with differing column counts.`
  );
};

export default IncongruentTablesAlert;
export { validateIncongruentTables, code };
