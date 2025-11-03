import { Alert } from "../Alert.js";
import { SEVERITY_ERROR } from "../../index.js";

const code = "JOIN_PREDICATE_MISSING";

const MissingJoinPredicateAlert = (
  sourceId,
  isPassing = false,
  message = null
) =>
  Alert(
    code,
    "Missing join predicate",
    "Pack operations require the user to specify how values in both tables' join key columns are matched.",
    SEVERITY_ERROR,

    sourceId,
    isPassing,
    message
  );

const validateMissingJoinPredicate = (operation) => {
  return MissingJoinPredicateAlert(
    operation.id,
    !!operation.joinPredicate,
    `Pack operation "${operation.name}" is missing a join predicate.`
  );
};

export default MissingJoinPredicateAlert;
export { validateMissingJoinPredicate, code };
