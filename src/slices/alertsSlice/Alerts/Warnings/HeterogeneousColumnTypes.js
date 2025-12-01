import { transpose } from "d3";
import { Alert } from "../Alert.js";
import { SEVERITY_WARNING } from "../index.js";

const code = "HETEROGENEOUS_COLUMN_TYPES";

const HeterogeneousColumnTypesAlert = (sourceId, isPassing, message) =>
  Alert(
    code,
    "Heterogeneous Column Types",
    "All vertical groups of columns must have the same data type to create a stack view.",
    SEVERITY_WARNING,

    sourceId,
    isPassing,
    message
  );

const validateHeterogeneousColumnTypes = (operation, columnTypeMatrix) => {
  const heterogeneousIndices = [];
  const transposedMatrix = transpose(columnTypeMatrix);
  transposedMatrix.forEach((columnTypes, index) => {
    const firstType = columnTypes[0];
    const allSameType = columnTypes.every((type) => type === firstType);
    if (!allSameType) {
      heterogeneousIndices.push(index + 1); // +1 to convert from 0-based to 1-based index for user readability
    }
  });

  const allColumnCountsEqual = heterogeneousIndices.length === 0;

  return HeterogeneousColumnTypesAlert(
    operation.id,
    allColumnCountsEqual,
    `Stack operation ${
      operation.name || ""
    } has different column types at indices: ${heterogeneousIndices.join(
      ", "
    )}.`
  );
};

export default HeterogeneousColumnTypesAlert;
export { validateHeterogeneousColumnTypes, code };
