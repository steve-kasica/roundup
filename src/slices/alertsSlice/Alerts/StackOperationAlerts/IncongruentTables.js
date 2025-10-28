import FatalAlert from "../FatalAlert";

export default class IncongruentTablesAlert extends FatalAlert {
  constructor(message, sourceId) {
    super(message, sourceId);
    this.code = "INCONGRUENT_TABLES";
    this.name = "Incongruent Tables";
    this.description =
      "All child tables must have the same number of columns to create a stack view.";
  }
}

export const validateIncongruentTables = (operation) => {
  const columnCount = operation.children.map(
    (child) => child.columnNames.length
  );

  const allColumnCountsEqual = columnCount.every(
    (count) => count === columnCount[0]
  );
  if (!allColumnCountsEqual) {
    throw new IncongruentTablesAlert(
      `Child tables in Stack view ${operation.name} have differing column counts`,
      operation.id
    );
  }
  return null;
};
