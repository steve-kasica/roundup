import { Alert } from "../Alert.js";
import { SEVERITY_ERROR } from "../../index.js";

const code = "JOIN_KEY_LEFT_MISSING";

const MissingLeftJoinKeyAlert = (sourceId, isPassing = false, message = null) =>
  Alert(
    code,
    "Missing join key",
    "Pack operations require that the user specify a join key in the left-hand table.",
    SEVERITY_ERROR,

    sourceId,
    isPassing,
    message
  );

const validateMissingLeftJoinKey = (operation) => {
  return MissingLeftJoinKeyAlert(
    operation.id,
    !!operation.joinKey1,
    `Pack operation "${operation.name}" is missing a join key in the left table.`
  );
};

export { validateMissingLeftJoinKey, code };
export default MissingLeftJoinKeyAlert;
