/**
 * @fileoverview Missing join type error alert for PACK operations.
 * @module slices/alertsSlice/Alerts/Errors/MissingJoinType
 *
 * Alert triggered when a PACK operation is missing its join type
 * (INNER, LEFT OUTER, FULL OUTER, etc.).
 *
 * @example
 * import { validateMissingJoinType } from './MissingJoinType';
 * const alert = validateMissingJoinType(operation);
 */
import { Alert } from "../Alert.js";
import { SEVERITY_ERROR } from "../../index.js";

const code = "JOIN_TYPE_MISSING";

const MissingJoinTypeAlert = (sourceId, isPassing = false, message = null) =>
  Alert(
    code,
    "Missing join type error",
    "Pack operations require a join type.",
    SEVERITY_ERROR,

    sourceId,
    isPassing,
    message
  );

const validateMissingJoinType = (operation) => {
  return MissingJoinTypeAlert(
    operation.id,
    !!operation.joinType,
    `Pack operation "${operation.name}" is missing a join type.`
  );
};

export default MissingJoinTypeAlert;
export { validateMissingJoinType, code };
