/**
 * @fileoverview Higher-order component (HOC) that provides pack operation-specific data and actions
 * to the wrapped component. This HOC connects to the Redux store to fetch and manage data related to
 * pack operations, including join predicates, join types, child table information, match statistics,
 * and table dimensions.
 *
 * Exports a function `withPackOperationData` that takes a React component as an argument
 * and returns a new component enhanced with pack operation data and actions as props.
 *
 * @module components/HOC/withPackOperationData
 */
import { useSelector, useDispatch } from "react-redux";
import { useCallback, useMemo } from "react";
import {
  selectColumnIdsByParentId,
  selectSelectedColumnIdsByParentId,
} from "../../slices/columnsSlice/selectors";
import { updateOperationsRequest } from "../../sagas/updateOperationsSaga";
import {
  JOIN_TYPES,
  MATCH_STATS_DEFAULT,
  MATCH_TYPE_LEFT_UNMATCHED,
  MATCH_TYPE_MATCHES,
  MATCH_TYPE_RIGHT_UNMATCHED,
  OPERATION_TYPE_PACK,
  selectOperationsById,
} from "../../slices/operationsSlice";

/**
 * @typedef {Object} PackOperationDataProps
 * @property {string} id - The operation's unique identifier
 *
 * Pack-specific props:
 * @property {string} joinPredicate - The join predicate for this pack operation (e.g., EQUALS, CONTAINS)
 * @property {string} joinType - The type of join used (e.g., LEFT, INNER, FULL)
 * @property {(joinPredicate: string) => void} setJoinPredicate - Updates the join predicate
 * @property {(joinType: string) => void} setJoinType - Updates the join type
 *
 * Left table props:
 * @property {string|null} leftTableId - Left table ID (alias for childIds[0])
 * @property {string} leftKey - Left table join key
 * @property {Array<string>} leftColumnIds - Array of column IDs for the left table
 * @property {number} leftColumnCount - Number of columns in the left table
 * @property {Array<string>} leftSelectedColumns - Array of selected column IDs in the left table
 * @property {(columnId: string) => void} setLeftTableJoinKey - Updates the left table join key
 *
 * Right table props:
 * @property {string|null} rightTableId - Right table ID (alias for childIds[1])
 * @property {string} rightKey - Right table join key
 * @property {Array<string>} rightColumnIds - Array of column IDs for the right table
 * @property {number} rightColumnCount - Number of columns in the right table
 * @property {Array<string>} rightSelectedColumns - Array of selected column IDs in the right table
 * @property {(columnId: string) => void} setRightTableJoinKey - Updates the right table join key
 *
 * Match statistics:
 * @property {Object} matchStats - Object containing match statistics for the pack operation `{left_unmatched, matches, right_unmatched}`
 * @property {Array<string>} matchKeys - Array of match type keys (e.g., LEFT_UNMATCHED, MATCHES)
 * @property {Map<string, string>} matchLabels - Map of match type keys to labels (e.g., "Left Only", "Matches")
 * @property {Array<string>} validMatchGroups - Array of valid match type keys based on join type
 *
 * Table dimensions:
 * @property {number|null} rowCount - Estimated or actual row count of the pack operation
 * @property {number} columnCount - Total number of columns in both child tables
 */

/**
 *
 * @function
 * @template P
 * @param {React.ComponentType<P & PackOperationDataProps>} WrappedComponent
 * @returns {React.ComponentType<P & {id: string}>} EnhancedPackComponent
 *
 */
export default function withPackOperationData(WrappedComponent) {
  function EnhancedPackComponent({ id, ...props }) {
    const dispatch = useDispatch();
    const operation = useSelector((state) => selectOperationsById(state, id));

    // Pack-specific props
    // --------------------------------------------------------------

    // Get the join predicate for this pack operation, e.g. EQUALS, CONTAINS, etc..
    const joinPredicate = useMemo(() => operation.joinPredicate, [operation]);

    // Get the type of join used in this pack operation, e.g. LEFT, INNER, FULL, etc..
    const joinType = useMemo(() => operation.joinType, [operation]);

    /**
     * Updates the join predicate for the current operation by dispatching an update action.
     *
     * @function
     * @param {any} joinPredicate - The new join predicate to set for the operation.
     * @returns {void}
     */
    const setJoinPredicate = useCallback(
      (joinPredicate) => {
        dispatch(updateOperationsRequest([{ id, joinPredicate }]));
      },
      [dispatch, id],
    );

    /**
     * Updates the join type for the current operation by dispatching an update action.
     *
     * @function
     * @param {any} joinType - The new join type to set for the operation.
     * @returns {void}
     */
    const setJoinType = useCallback(
      (joinType) => {
        dispatch(updateOperationsRequest([{ id, joinType }]));
      },
      [dispatch, id],
    );

    // Left table props
    // --------------------------------------------------------------

    /**
     * Left table ID for this pack operation (alias for childIds[0])
     */
    const leftTableId = useMemo(
      () => (operation.childIds.length > 0 ? operation.childIds[0] : null),
      [operation.childIds],
    );

    /**
     * Left table join key for this pack operation
     */
    const leftKey = useMemo(() => operation.joinKey1, [operation.joinKey1]);

    /**
     * Left table column IDs for this pack operation
     * @returns {Array} leftColumnIds - An array of column IDs for the left child table.
     */
    const leftColumnIds = useSelector((state) =>
      selectColumnIdsByParentId(state, leftTableId),
    );

    /**
     * Left table column count for this pack operation
     * @returns {number} leftColumnCount - The number of columns in the left child table.
     */
    const leftColumnCount = useMemo(
      () => leftColumnIds.length,
      [leftColumnIds],
    );

    /**
     * Get a list of selectedColumnIds in the left table
     * @returns {Array} leftSelectedColumnsIds - An array of selected column IDs in the left child table.
     */
    const leftSelectedColumnsIds = useSelector((state) =>
      selectSelectedColumnIdsByParentId(state, leftTableId),
    );

    /**
     * Updates the left table join key for the current operation by dispatching an update action.
     *
     * @function
     * @param {any} columnId - The new column ID to set as the left table join key.
     * @returns {void}
     */
    const setLeftTableJoinKey = useCallback(
      (columnId) => {
        dispatch(updateOperationsRequest([{ id, joinKey1: columnId }]));
      },
      [dispatch, id],
    );

    // Right table props
    // --------------------------------------------------------------

    /**
     * Right table ID for this pack operation (alias for childIds[1])
     */
    const rightTableId = useMemo(
      () => (operation.childIds.length === 2 ? operation.childIds[1] : null),
      [operation.childIds],
    );

    /**
     * Right table join key for this pack operation
     */
    const rightKey = useMemo(() => operation.joinKey2, [operation.joinKey2]);

    /**
     * Right table column IDs for this pack operation
     * @returns {Array} rightColumnIds - An array of column IDs for the right child table.
     */
    const rightColumnIds = useSelector((state) =>
      selectColumnIdsByParentId(state, rightTableId),
    );

    /**
     * Right table column count for this pack operation
     * @returns {number} rightColumnCount - The number of columns in the right child table.
     */
    const rightColumnCount = useMemo(
      () => rightColumnIds.length,
      [rightColumnIds],
    );

    /**
     * Get a list of selectedColumnIds in the right table
     * @returns {Array} rightSelectedColumnsIds - An array of selected column IDs in the right child table.
     */
    const rightSelectedColumnsIds = useSelector((state) =>
      rightTableId
        ? selectSelectedColumnIdsByParentId(state, rightTableId)
        : [],
    );

    /**
     * Updates the right table join key for the current operation by dispatching an update action.
     *
     * @function
     * @param {any} columnId - The new column ID to set as the right table join key.
     * @returns {void}
     */
    const setRightTableJoinKey = useCallback(
      (columnId) => {
        dispatch(updateOperationsRequest([{ id, joinKey2: columnId }]));
      },
      [dispatch, id],
    );

    // Match statistics for this pack operation
    // --------------------------------------------------------------

    /**
     * Match statistics for this pack operation
     * @returns {object} matchStats - An object containing match statistics for the pack operation.
     */
    const matchStats = useMemo(
      () => operation.matchStats,
      [operation.matchStats],
    );

    /**
     * Keys representing different match types in the pack operation
     * e.g. LEFT_UNMATCHED, RIGHT_UNMATCHED, MATCHES
     * @returns {Array} matchKeys - An array of match type keys.
     */
    const matchKeys = useMemo(() => [...MATCH_STATS_DEFAULT.keys()], []);

    /**
     * Labels for different match types in the pack operation
     * e.g. "Left Only", "Right Only", "Matches"
     * @returns {Map} matchLabels - A map of match type keys to their corresponding labels.
     */
    const matchLabels = useMemo(
      () =>
        [...MATCH_STATS_DEFAULT.keys()].reduce((acc, key) => {
          switch (key) {
            case MATCH_TYPE_LEFT_UNMATCHED:
              acc.set(key, "Left Only");
              break;
            case MATCH_TYPE_RIGHT_UNMATCHED:
              acc.set(key, "Right Only");
              break;
            case MATCH_TYPE_MATCHES:
              acc.set(key, "Matches");
              break;
            default:
              throw new Error(`Unknown match type: ${key}`);
          }
          return acc;
        }, new Map()),
      [],
    );

    /**
     * Valid match groups for this pack operation based on join type and match statistics
     *   Match groups are invalid dependeing on two conditions:
     *    - 1. If the user-specified join type exclude a certain match group,
     *      e.g. INNER JOIN excludes left- and right-only matches
     *    - 2. If the pack operation stats returned from the hook includes a
     *      zero count for a certain match type
     *
     * @returns {Array} validMatchGroups - An array of valid match type keys.
     */
    const validMatchGroups = useMemo(() => {
      let output = [];
      switch (operation.joinType) {
        case JOIN_TYPES.INNER:
          output = [MATCH_TYPE_MATCHES];
          break;
        case JOIN_TYPES.LEFT_OUTER:
          output = [MATCH_TYPE_MATCHES, MATCH_TYPE_LEFT_UNMATCHED];
          break;
        case JOIN_TYPES.RIGHT_OUTER:
          output = [MATCH_TYPE_MATCHES, MATCH_TYPE_RIGHT_UNMATCHED];
          break;
        case JOIN_TYPES.FULL_OUTER:
          output = [
            MATCH_TYPE_MATCHES,
            MATCH_TYPE_LEFT_UNMATCHED,
            MATCH_TYPE_RIGHT_UNMATCHED,
          ];
          break;
        case JOIN_TYPES.LEFT_ANTI:
          output = [MATCH_TYPE_LEFT_UNMATCHED];
          break;
        case JOIN_TYPES.RIGHT_ANTI:
          output = [MATCH_TYPE_RIGHT_UNMATCHED];
          break;
        case JOIN_TYPES.FULL_ANTI:
          output = [MATCH_TYPE_LEFT_UNMATCHED, MATCH_TYPE_RIGHT_UNMATCHED];
          break;
        case JOIN_TYPES.EMPTY:
          output = [];
          break;
        default:
          throw new Error(`Unknown join type: ${operation.joinType}`);
      }
      return output.filter((type) => matchStats[type] > 0);
    }, [operation.joinType, matchStats]);

    // Table dimensions
    // --------------------------------------------------------------

    /**
     * When an operation is materialized, we get its row count and
     * it's stored in the operation. But until we create the table
     * we may need to estimate the row count from the matchStats.
     * Views that use `withPackOperationData` can use this `rowCount` prop
     * but need to guard against when it's null.
     *
     * @returns {number|null} rowCount - The estimated row count of the pack operation.
     */
    const rowCount = useMemo(() => {
      const matchValues = Object.values(matchStats);
      if (operation?.rowCount != null) {
        return operation.rowCount;
      } else if (Math.max(...matchValues) > 0) {
        let total = matchValues.reduce((acc, val) => {
          acc += val;
          return acc;
        }, 0);
        if (total > 0) {
          return total;
        } else {
          return null;
        }
      } else {
        return undefined;
      }
    }, [operation?.rowCount, matchStats]);

    /**
     * Combined child column IDs from both left and right tables
     * @returns {Array<string>} combinedChildColumnIds - An array of column IDs from both child tables.
     */
    const combinedChildColumnIds = useMemo(
      () => [...leftColumnIds, ...rightColumnIds],
      [leftColumnIds, rightColumnIds],
    );

    /**
     * Total columns directly associated with this pack operation.
     * @returns {number} columnCount - The total number of columns in both child tables.
     */
    const columnCount = useMemo(() => {
      if (operation?.columnCount > 0 && operation.isInSync) {
        return operation.columnCount;
      } else if (operation?.columnIds.length > 0) {
        return operation.columnIds.length;
      } else if (combinedChildColumnIds?.length > 0) {
        return combinedChildColumnIds.length;
      } else {
        return undefined;
      }
    }, [
      operation.columnCount,
      operation.isInSync,
      operation.columnIds.length,
      combinedChildColumnIds.length,
    ]);

    // The display name of this operation
    const name = useMemo(() => {
      if (operation.name && operation.name.trim().length > 0) {
        return operation.name;
      } else {
        return "Pack op.";
      }
    }, [operation.name]);

    return (
      <WrappedComponent
        id={id}
        name={name}
        operationType={OPERATION_TYPE_PACK}
        // Pack-specific props
        joinPredicate={joinPredicate}
        joinType={joinType}
        setJoinPredicate={setJoinPredicate}
        setJoinType={setJoinType}
        // Left table props
        leftTableId={leftTableId}
        leftKey={leftKey}
        leftColumnIds={leftColumnIds}
        leftColumnCount={leftColumnCount}
        leftSelectedColumns={leftSelectedColumnsIds}
        setLeftTableJoinKey={setLeftTableJoinKey}
        // Right table props
        rightTableId={rightTableId}
        rightKey={rightKey}
        rightColumnIds={rightColumnIds}
        rightColumnCount={rightColumnCount}
        rightSelectedColumns={rightSelectedColumnsIds}
        setRightTableJoinKey={setRightTableJoinKey}
        // Match statistics
        matchStats={matchStats}
        matchKeys={matchKeys}
        matchLabels={matchLabels}
        validMatchGroups={validMatchGroups}
        // Table dimensions
        rowCount={rowCount}
        columnCount={columnCount}
        // Misc
        combinedChildColumnIds={combinedChildColumnIds}
        {...props}
      />
    );
  }

  EnhancedPackComponent.displayName = `withPackOperationData(${
    WrappedComponent.displayName || WrappedComponent.name || "Component"
  })`;

  return EnhancedPackComponent;
}
