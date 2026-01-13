/**
 * Get the set of selected column indices based on selected column IDs.
 * Given a matrix of column IDs and an array of selected column IDs,
 * this function returns a set of indices corresponding to the selected columns.
 *
 * This is useful for determining which operation columns to display given
 * which columns are selected across multiple child tables.
 *
 * @param {Array[Array]} columnIdMatrix
 * @param {Array} selectedColumnIds
 * @returns {Set} Set of selected column indices
 */
export const getSelectedColumnIndices = (columnIdMatrix, selectedColumnIds) => {
  const selectedChildColumnIdsSet = new Set(selectedColumnIds);
  const selectedIndices = new Set();
  columnIdMatrix.forEach((columnIds) => {
    columnIds.forEach((colId, colIndex) => {
      if (selectedChildColumnIdsSet.has(colId)) {
        selectedIndices.add(colIndex);
      }
    });
  });
  return selectedIndices;
};
