import { validateMissingJoinPredicate } from "./MissingJoinPredicate";
import { validateMissingJoinType } from "./MissingJoinType";
import { validateMissingLeftJoinKey } from "./MissingLeftJoinKey";
import { validateMissingRightJoinKey } from "./MissingRightJoinKey";
import { validateIncongruentTables } from "./IncongruentTables";

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

const testStackOperationForFatalErrors = (operation, childColumnCounts) => {
  const fatalErrors = [validateIncongruentTables(operation, childColumnCounts)];
  const warnings = [];
  return {
    fatalErrors,
    isAllPassing: fatalErrors.every((alert) => alert.isPassing === true),
    warnings,
  };
};

export { testPackOperationForFatalErrors, testStackOperationForFatalErrors };
