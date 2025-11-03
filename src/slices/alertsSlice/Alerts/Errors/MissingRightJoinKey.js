import { Alert } from "../Alert.js";
import { SEVERITY_ERROR } from "../../index.js";

const code = "JOIN_KEY_RIGHT_MISSING";

const MissingRightJoinKeyAlert = (
  sourceId,
  isPassing = false,
  message = null
) =>
  Alert(
    code,
    "Missing join key",
    "Pack operations require that the user specify a join key in the right-hand table.",
    SEVERITY_ERROR,

    sourceId,
    isPassing,
    message
  );

const validateMissingRightJoinKey = (operation) => {
  return MissingRightJoinKeyAlert(
    operation.id,
    !!operation.joinKey2,
    `Pack operation "${operation.name}" is missing a join key in the right table.`
  );
};

export { validateMissingRightJoinKey, code };
export default MissingRightJoinKeyAlert;
