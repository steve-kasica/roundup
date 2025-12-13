/**
 * Operation.js
 *
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

export const MATCH_TYPE_LEFT_UNMATCHED = "left_unmatched";
export const MATCH_TYPE_MATCHES = "matches";
export const MATCH_TYPE_RIGHT_UNMATCHED = "right_unmatched";

/**
 * I'm using Map here to ensure the order of the match keys is preserved,
 * this is used for indexing into the opeation table by row index and partitioning
 * rows by match type. This order must be consistent with how the table is ordered
 * in `createPackView.js`.
 */
export const MATCH_STATS_DEFAULT = new Map([
  [MATCH_TYPE_MATCHES, 0],
  [MATCH_TYPE_LEFT_UNMATCHED, 0],
  [MATCH_TYPE_RIGHT_UNMATCHED, 0],
]);

let idCounter = 0; // each node gets a unique ID, regardless if it's a table vs operation node

/**
 *
 * @param {*} param0
 * @returns {object} Operation object
 *  * `matchStats` only apply to PACK operations are are derived from other pack operation parameters. They are not set by the user
 */
export default function Operation({
  operationType = null,
  name = null,
  databaseName = null,
  parentId = null,
  childIds = [],
  columnIds = [],
  hiddenColumnIds = [],
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
    hiddenColumnIds,
    rowCount,
    operationType,
    isMaterialized: false, // Initially false, can be updated later
    isInSync: false, // Initially false, can be updated later

    // Properties specific to PACK operations
    ...(operationType === OPERATION_TYPE_PACK
      ? {
          joinType,
          joinPredicate,
          joinKey1,
          joinKey2,
          matchStats: { ...MATCH_STATS_DEFAULT }, // to be calculated: match counts and cardinality breakdown
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
