import FatalAlert from "../FatalAlert";

export default class MissingJoinKeyAlert extends FatalAlert {
  constructor(message, sourceId) {
    super(message, sourceId);
    this.name = "Missing Join Key";
    this.description =
      "Pack operations require that the user specify a join key in each table.";
    this.code = "JOIN_KEY_MISSING";
  }
}

export const validateMissingLeftJoinKey = (operation) => {
  if (!operation.joinKey1) {
    throw new MissingJoinKeyAlert(
      `Pack operation "${operation.name}" is missing a join key in one or both tables.`,
      operation.id
    );
  }
  return null;
};

export const validateMissingRightJoinKey = (operation) => {
  if (!operation.joinKey2) {
    throw new MissingJoinKeyAlert(
      `Pack operation "${operation.name}" is missing a join key in one or both tables.`,
      operation.id
    );
  }
  return null;
};
