// Exported comparison functions
export const equals = (leftValue, rightValue) => leftValue === rightValue;

export const contains = (leftValue, rightValue) =>
  leftValue.includes(rightValue);

export const startsWith = (leftValue, rightValue) =>
  leftValue.startsWith(rightValue);

export const endsWith = (leftValue, rightValue) =>
  leftValue.endsWith(rightValue);
