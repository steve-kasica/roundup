export const getRowCount = (rowCount, rowRanges) => {
  return rowCount !== null
    ? rowCount
    : [...rowRanges.entries()].reduce(
        (acc, [, { end }]) => Math.max(acc, end),
        0,
      );
};

export const getColumnIdMatrix = (childColumnIds) => {
  const maxLength = Math.max(...childColumnIds.map((row) => row.length), 0);
  const backfilledMatrix = childColumnIds.map((row) => {
    if (row.length < maxLength) {
      return [...row, ...Array(maxLength - row.length).fill(null)];
    }
    return row;
  });
  return backfilledMatrix;
};
