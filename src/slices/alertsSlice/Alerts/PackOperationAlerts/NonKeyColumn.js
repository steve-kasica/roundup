import WarningError from "../WarningAlert";

export class NonKeyColumnAlert extends WarningError {
  constructor(message, sourceId) {
    super(message, sourceId);
    this.name = "Non-key column warning";
    this.description =
      "The specified column used as a join key is not a key column and may contain duplicate values, which could lead to unexpected results in the pack operation.";
    this.code = "NON_KEY_COLUMN";
  }
}

export const validateNonKeyColumn = (operation, table, column) => {
  const keynessRatio = column.uniqueValueCount / table.rowCount;
  if (keynessRatio < 1) {
    return new NonKeyColumnAlert(
      `Column "${column.name}" in table "${table.name}" is not a key column.`,
      operation.id
    );
  }
  return null;
};
