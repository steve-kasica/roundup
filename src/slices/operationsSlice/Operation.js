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

export const JOIN_TYPES = { INNER: "INNER", LEFT: "LEFT", RIGHT: "RIGHT" };
export const JOIN_SPEC_SCHEMA = {
  joinType: JOIN_TYPES.INNER,
  joinKey1: null,
  joinKey2: null,
};

let idCounter = 0; // each node gets a unique ID, regardless if it's a table vs operation node

export default function Operation(operationType, children) {
  // If the supplied operation type is not one of the valid
  // operation types, then throw an error
  if (!validOperationTypes.includes(operationType)) {
    throw new Error("Invalid operation type");
  }
  const id = `o${++idCounter}`; // Each operation has a unique ID

  return {
    id, // ID is immutable and unique
    name: id, // Name is the same as ID by default, can be changed later
    rowCount: null,
    columnCount: null,
    operationType,
    children,
    error: null, // Error state for the operation

    // TODO: should there be different factors for stack and pack operations
    // since they have similar but different schema?
    // Maybe they can "inherit" from a generic operation factory
    // It's like inheritance in functional programming.
    joinSpec:
      operationType === OPERATION_TYPE_PACK ? JOIN_SPEC_SCHEMA : undefined,
  };
}

const attributes = [
  "id",
  "name",
  "operationType",
  "children",
  "rowCount",
  "columnCount",
  "error",
];

export const isOperation = (obj) =>
  obj !== null &&
  typeof obj === "object" &&
  Object.keys(obj).length > 0 &&
  attributes.every((key) => key in obj);

export function isOperationId(id) {
  return typeof id === "string" && id.startsWith("o");
}
