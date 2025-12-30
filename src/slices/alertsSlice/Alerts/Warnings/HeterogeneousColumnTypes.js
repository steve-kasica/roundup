/**
 * @fileoverview Heterogeneous column types warning alert for STACK operations.
 * @module slices/alertsSlice/Alerts/Warnings/HeterogeneousColumnTypes
 *
 * Warning triggered when columns in corresponding positions across child
 * tables have different data types (e.g., INTEGER vs VARCHAR).
 *
 * Features:
 * - Transposes column type matrix to compare by position
 * - Identifies which column indices have mismatched types
 * - Provides user-friendly 1-based index references
 *
 * @example
 * import { validateHeterogeneousColumnTypes } from './HeterogeneousColumnTypes';
 * const alert = validateHeterogeneousColumnTypes(operation, [['INT', 'TEXT'], ['INT', 'INT']]);
 */
import { transpose } from "d3";
import { Alert } from "../Alert.js";
import { SEVERITY_WARNING } from "../index.js";

const code = "HETEROGENEOUS_COLUMN_TYPES";

const HeterogeneousColumnTypesAlert = (sourceId, isPassing, message) =>
  Alert(
    code,
    "Heterogeneous Column Types",
    "All vertical groups of columns should have the same data type.",
    SEVERITY_WARNING,

    sourceId,
    isPassing,
    message
  );

const validateHeterogeneousColumnTypes = (operation, columnTypeMatrix) => {
  const heterogeneousIndices = [];
  const transposedMatrix = transpose(columnTypeMatrix);
  transposedMatrix.forEach((columnTypes, index) => {
    const firstType = columnTypes[0];
    const allSameType = columnTypes.every((type) => type === firstType);
    if (!allSameType) {
      heterogeneousIndices.push(index + 1); // +1 to convert from 0-based to 1-based index for user readability
    }
  });

  const allColumnCountsEqual = heterogeneousIndices.length === 0;

  return HeterogeneousColumnTypesAlert(
    operation.id,
    allColumnCountsEqual,
    `Stack operation ${
      operation.name || ""
    } has different column types at indices: ${heterogeneousIndices.join(
      ", "
    )}.`
  );
};

export default HeterogeneousColumnTypesAlert;
export { validateHeterogeneousColumnTypes, code };
