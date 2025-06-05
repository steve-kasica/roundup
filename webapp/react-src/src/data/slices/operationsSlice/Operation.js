/**
 * Operations keep track of their children nodes, as opposed to keeping track of their parent nodes. Because
 * It provides a natural tree structure for rending operations and components in a doward traversal. It is
 * Easy to add or remove children nodes, following an iteratiev approach consistent with direct manipulation.
 * The one downside is upward travelsal is not as straightforward, but this is not a common use case.
 */
export const OPERATION_TYPE_STACK = "stack";
export const OPERATION_TYPE_PACK = "pack";
export const OPERATION_TYPE_NO_OP = "no-op";

const validOperationTypes = [
  OPERATION_TYPE_STACK,
  OPERATION_TYPE_PACK,
  OPERATION_TYPE_NO_OP,
];

let idCounter = 0; // each node gets a unique ID, regardless if it's a table vs operation node

export default function Operation(operationType, children) {
  // If the supplied operation type is not one of the valid
  // operation types, then throw an error
  if (!validOperationTypes.includes(operationType)) {
    throw new Error("Invalid operation type");
  }

  return {
    id: `o-${++idCounter}`, // Each operation has a unique ID
    operationType,
    children,
  };
}

export function isOperation(obj) {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof obj.id === "string" &&
    typeof obj.operationType === "string"
  );
}

export function isOperationId(id) {
  return (
    typeof id === "string" &&
    id.startsWith("o-") &&
    !isNaN(parseInt(id.slice(2), 10)) // Check if the rest of the ID is a number
  );
}
