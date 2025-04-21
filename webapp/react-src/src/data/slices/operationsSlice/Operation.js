import { sum } from "d3";
import { isSourceTable } from "../sourceTablesSlice";

export const OPERATION_TYPE_STACK = "stack";
export const OPERATION_TYPE_PACK = "pack";
export const OPERATION_TYPE_NO_OP = "no-op";

const validOperationTypes = [
  OPERATION_TYPE_STACK,
  OPERATION_TYPE_PACK,
  OPERATION_TYPE_NO_OP,
];

let nodeIdCounter = 0; // each node gets a unique ID, regardless if it's a table vs operation node

export const CHILD_TYPE_OPERATION = "operation";
export const CHILD_TYPE_TABLE = "table";

export function Child(type, id) {
  return { type, id };
}

export default function Operation(operationType, parentId, depth, children) {
  // If the supplied operation type is not one of the valid
  // operation types, then throw an error
  if (!validOperationTypes.includes(operationType)) {
    throw new Error("Invalid operation type");
  }

  let columnCount;
  if (operationType === OPERATION_TYPE_STACK) {
    columnCount = Math.max(...children.map(({ columnCount }) => columnCount));
  } else {
    columnCount = sum(children, (d) => d.columnCount);
  }

  children = children.map((child) => {
    if (isSourceTable(child)) {
      return new Child(CHILD_TYPE_TABLE, child.id);
    } else {
      return new Child(CHILD_TYPE_OPERATION, child.id);
    }
  });

  return {
    // Each operation has a unique ID
    id: `o-${++nodeIdCounter}`,

    // The parentId is the ID of the operation that this
    // operation is a child of
    // If this operation is a root operation, then the parentId
    // is the empty string
    parentId,

    // The operationType is the type of operation this
    // operation is (e.g. stack, pack, no-op)
    // This is used to determine how to render the operation
    // and how to process the operation
    // in the backend.
    operationType,

    // The children property is an array of IDs of the
    // operations and tables that are children of this operation
    children,

    // The depth property is the depth of this operation
    // in the operation tree. This is used to determine
    // how to render the operation in the UI
    // and how to process the operation in the backend.
    depth: depth,

    // The maxColumns property is the maximum number of
    // columns in children of this operation
    columnCount,

    // TODO: maxRows
  };
}

export function isOperation(obj) {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof obj.id === "string" &&
    typeof obj.parentId === "string" &&
    validOperationTypes.includes(obj.operationType)
  );
}
