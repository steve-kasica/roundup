import FatalAlert from "../FatalAlert";

export default class MissingJoinTypeAlert extends FatalAlert {
  constructor(message, sourceId) {
    super(message, sourceId);
    this.name = "MissingJoinTypeError";
    this.description = "Pack operations require a join type.";
    this.code = "JOIN_TYPE_MISSING";
  }
}

export const validateMissingJoinType = (operation) => {
  if (!operation.joinType) {
    throw new MissingJoinTypeAlert(
      `Pack operation "${operation.name}" is missing a join type.`,
      operation.id
    );
  }
  return null;
};
