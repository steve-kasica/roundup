/**
 * @fileoverview Operation factory and type constants.
 * @module slices/operationsSlice/Operation
 *
 * Defines the Operation factory function for creating operation objects
 * and exports operation type, join type, and predicate constants.
 *
 * Features:
 * - Factory function for serializable operation objects
 * - Operation types: STACK, PACK, NO_OP
 * - Join types: INNER, LEFT OUTER, FULL OUTER, etc.
 * - Join predicates: EQUALS, CONTAINS, STARTS_WITH, etc.
 * - Match statistics structure for PACK operations
 *
 * @example
 * import { Operation, OPERATION_TYPE_PACK, JOIN_TYPES } from './Operation';
 * const op = Operation({ operationType: OPERATION_TYPE_PACK, childIds: ['t1', 't2'] });
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

export const DEFAULT_JOIN_TYPE = JOIN_TYPES.FULL_OUTER;

export const JOIN_PREDICATES = {
  EQUALS: "EQUALS",
  CONTAINS: "CONTAINS",
  STARTS_WITH: "STARTS_WITH",
  ENDS_WITH: "ENDS_WITH",
};

export const DEFAULT_JOIN_PREDICATE = JOIN_PREDICATES.EQUALS;

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
  hiddenColumnIds = [], // TODO: remove hidden columns for now
  rowCount = null,
  joinKey1 = null,
  joinKey2 = null,
  joinPredicate = JOIN_PREDICATES.EQUALS,
  joinType = JOIN_TYPES.FULL_OUTER,
  isMaterialized = false,
  isInSync = false,
} = {}) {
  const id = `o${++idCounter}`; // Each operation has a unique ID

  return {
    id,
    name,
    databaseName,
    operationType,
    parentId,
    childIds,
    columnIds,
    hiddenColumnIds, // TODO: delete
    rowCount,
    isMaterialized,
    isInSync,

    // Properties specific to PACK operations
    ...(operationType === OPERATION_TYPE_PACK
      ? {
          joinType,
          joinPredicate,
          joinKey1,
          joinKey2,
          matchStats: Object.fromEntries(MATCH_STATS_DEFAULT.entries()), // to be calculated: match counts and cardinality breakdown
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
