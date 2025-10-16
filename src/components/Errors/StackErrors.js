export class IncongruentTablesError extends Error {
  constructor(message) {
    super(message);
    this.name = "Incongruent Tables Error";
    this.description =
      "All child tables must have the same number of columns to create a stack view.";
    this.code = "INCONGRUENT_TABLES";
  }
}
