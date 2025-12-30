/**
 * @fileoverview Alert validation utilities for PACK and STACK operations.
 * @module slices/alertsSlice/Alerts/Errors/utilities
 *
 * Provides functions to test operations for fatal errors and warnings.
 * Used by the alertsSaga to validate operations before view creation.
 *
 * Features:
 * - Test PACK operations for missing join configuration
 * - Test STACK operations for column count/type mismatches
 * - Returns structured results with all alerts and passing status
 *
 * @example
 * import { testPackOperationForFatalErrors } from './utilities';
 * const { fatalErrors, isAllPassing } = testPackOperationForFatalErrors(operation);
 */
import { validateMissingJoinPredicate } from "./MissingJoinPredicate";
import { validateMissingJoinType } from "./MissingJoinType";
import { validateMissingLeftJoinKey } from "./MissingLeftJoinKey";
import { validateMissingRightJoinKey } from "./MissingRightJoinKey";
import { validateIncongruentTables } from "./IncongruentTables";
import { validateHeterogeneousColumnTypes } from "../Warnings/HeterogeneousColumnTypes";

const testPackOperationForFatalErrors = (operation) => {
  const fatalErrors = [
    validateMissingLeftJoinKey(operation),
    validateMissingRightJoinKey(operation),
    validateMissingJoinPredicate(operation),
    validateMissingJoinType(operation),
  ];
  const warnings = [];
  return {
    fatalErrors,
    isAllPassing: fatalErrors.every((alert) => alert.isPassing === true),
    warnings,
  };
};

const testStackOperationForFatalErrors = (operation, childColumns) => {
  const childColumnCounts = childColumns.map((columns) => columns.length);
  const childColumnTypes = childColumns.map((columns) =>
    columns.map((column) => column.columnType)
  );
  const fatalErrors = [
    validateIncongruentTables(operation, childColumnCounts),
    validateHeterogeneousColumnTypes(operation, childColumnTypes),
  ];
  const warnings = [];
  return {
    fatalErrors,
    isAllPassing: fatalErrors.every((alert) => alert.isPassing === true),
    warnings,
  };
};

export { testPackOperationForFatalErrors, testStackOperationForFatalErrors };
