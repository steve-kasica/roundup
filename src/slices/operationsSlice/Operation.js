/**
 * Operation.js
 *
 */
export const OPERATION_TYPE_STACK = "stack";
export const OPERATION_TYPE_PACK = "pack";
export const OPERATION_TYPE_NO_OP = "no-op";

export const JOIN_TYPES = {
  FULL_OUTER: "FULL OUTER",
  LEFT_OUTER: "LEFT OUTER",
  FULL_ANTI: "FULL ANTI",
  LEFT_ANTI: "LEFT ANTI",
  RIGHT_OUTER: "RIGHT OUTER",
  INNER: "INNER",
  RIGHT_ANTI: "RIGHT ANTI",
  EMPTY: "EMPTY",
};

export const JOIN_PREDICATES = {
  EQUALS: "EQUALS",
  CONTAINS: "CONTAINS",
  STARTS_WITH: "STARTS_WITH",
  ENDS_WITH: "ENDS_WITH",
};

let idCounter = 0; // each node gets a unique ID, regardless if it's a table vs operation node

export default function Operation({
  operationType = null,
  name = null,
  databaseName = null,
  parentId = null,
  childIds = [],
  columnIds = [],
  rowCount = null,
  joinKey1 = null,
  joinKey2 = null,
  joinPredicate = JOIN_PREDICATES.EQUALS,
  joinType = JOIN_TYPES.FULL_OUTER,
} = {}) {
  const id = `o${++idCounter}`; // Each operation has a unique ID

  return {
    id,
    name,
    databaseName,
    parentId,
    childIds,
    columnIds,
    rowCount,
    operationType,
    isMaterialized: false, // Initially false, can be updated later
    isInSync: false, // Initially false, can be updated later

    // Properties specific to PACK operations
    ...(operationType === OPERATION_TYPE_PACK
      ? {
          joinType,
          joinPredicate,
          joinKey1: joinKey1,
          joinKey2: joinKey2,
        }
      : {}),
  };
}

const attributes = ["name", "operationType"];

export const isOperation = (obj) =>
  obj !== null &&
  typeof obj === "object" &&
  Object.keys(obj).length > 0 &&
  attributes.every((key) => key in obj);

export function isOperationId(id) {
  return typeof id === "string" && id.startsWith("o");
}
