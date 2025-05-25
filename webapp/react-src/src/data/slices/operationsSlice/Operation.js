import { sum } from "d3";
import { isTable } from "../sourceTablesSlice";

export const OPERATION_TYPE_STACK = "stack";
export const OPERATION_TYPE_PACK = "pack";
export const OPERATION_TYPE_NO_OP = "no-op";

const validOperationTypes = [
  OPERATION_TYPE_STACK,
  OPERATION_TYPE_PACK,
  OPERATION_TYPE_NO_OP,
];

let idCounter = 0; // each node gets a unique ID, regardless if it's a table vs operation node

export default function Operation(operationType, tableIds) {
  // If the supplied operation type is not one of the valid
  // operation types, then throw an error
  if (!validOperationTypes.includes(operationType)) {
    throw new Error("Invalid operation type");
  }

  return {
    id: `o-${++idCounter}`, // Each operation has a unique ID
    operationType,
    tableIds,
    status: {
      isHovered: false,
      isSelected: false,
    },
  };
}

export function isOperation(obj) {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof obj.id === "string" &&
    typeof obj.operationType === "string" &&
    validOperationTypes.includes(obj.operationType)
  );
}
