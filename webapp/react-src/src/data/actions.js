import { createAction } from "@reduxjs/toolkit";

export const sourceTableSelected = createAction("sourceTable/selected");

export const removeMultipleColumns = createAction(
  "SourceColumn/removeMultipleColumns"
);
