import FatalAlert from "../FatalAlert";

export default class MissingJoinPredicateAlert extends FatalAlert {
  constructor(message, sourceId) {
    super(message, sourceId);
    this.name = "MissingJoinPredicateAlert";
    this.description =
      "Pack operations require the user to specify how values in both tables' join key columns are matched.";
    this.code = "JOIN_PREDICATE_MISSING";
  }
}

export const validateMissingJoinPredicate = (operation) => {
  if (!operation.joinPredicate) {
    throw new MissingJoinPredicateAlert(
      `Pack operation "${operation.name}" is missing a join predicate.`,
      operation.id
    );
  }
  return null;
};
