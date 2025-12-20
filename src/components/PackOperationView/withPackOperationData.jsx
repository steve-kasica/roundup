import { useSelector, useDispatch } from "react-redux";
import withOperationData from "../HOC/withOperationData";
import { useCallback, useMemo } from "react";
import {
  selectColumnsById,
  selectSelectedColumnIdsByParentId,
} from "../../slices/columnsSlice/selectors";
import { selectTablesById } from "../../slices/tablesSlice";
import { updateOperationsRequest } from "../../sagas/updateOperationsSaga";
import {
  setSelectedMatches,
  selectSelectedMatches,
} from "../../slices/uiSlice";
import {
  JOIN_TYPES,
  MATCH_STATS_DEFAULT,
  MATCH_TYPE_LEFT_UNMATCHED,
  MATCH_TYPE_MATCHES,
  MATCH_TYPE_RIGHT_UNMATCHED,
  selectOperationsById,
} from "../../slices/operationsSlice";

export default function withPackOperationData(WrappedComponent) {
  function EnhancedPackComponent({
    // Props passed from withOperationData
    id,
    joinKey1,
    joinKey2,
    joinPredicate,
    childIds,
    columnIds,
    selectedColumnIds,
    activeChildColumnIds,
    rowCount: dbRowCount,
    // Props passed directly from parent
    ...props
  }) {
    const dispatch = useDispatch();

    const operation = useSelector((state) => selectOperationsById(state, id));

    const matchStats = useMemo(() => operation.matchStats || {}, [operation]);
    const matchKeys = useMemo(() => [...MATCH_STATS_DEFAULT.keys()], []);
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
      []
    );

    // Match groups are invalid dependeing on two conditions:
    //  1. If the user-specified join type exclude a certain match group,
    //     e.g. INNER JOIN excludes left- and right-only matches
    //  2. If the pack operation stats returned from the hook includes a
    //     zero count for a certain match type/
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

    // When an operation is materialized, we get its row count and
    // it's stored in the operation. But until we create the table
    // we may need to estimate the row count from the matchStats.
    // Views that use `withPackOperationData` can use this `rowCount` prop
    // but need to guard against when it's null.
    const rowCount = useMemo(() => {
      if (dbRowCount && dbRowCount >= 0) {
        return dbRowCount;
      } else {
        let total = Object.values(matchStats).reduce((acc, val) => {
          acc += val;
          return acc;
        }, 0);
        if (total > 0) {
          return total;
        } else {
          return null;
        }
      }
    }, [dbRowCount, matchStats]);

    // Handle case where there is only one child table
    const [leftTableId, rightTableId] = useMemo(
      () => (childIds.length === 2 ? childIds : [childIds[0], null]),
      [childIds]
    );

    // Handle case where there is only one child table
    const [leftColumnIds, rightColumnIds] = useMemo(
      () =>
        activeChildColumnIds.length === 2
          ? activeChildColumnIds
          : [activeChildColumnIds[0], []],
      [activeChildColumnIds]
    );

    const columnCount = useMemo(
      () => activeChildColumnIds.reduce((a, b) => a + b.length, 0),
      [activeChildColumnIds]
    );

    const tableToOpColumnMap = new Map();
    leftColumnIds.forEach((colId, i) => {
      tableToOpColumnMap.set(colId, {
        columnId: columnIds[i],
        tableId: childIds[0],
      });
    });
    rightColumnIds.forEach((colId, i) => {
      tableToOpColumnMap.set(colId, {
        columnId: columnIds[i + (leftColumnIds?.length || 0)],
        tableId: childIds[1],
      });
    });

    // Get a list of selectedColumnIds in the left table
    const leftSelectedColumnsIds = useSelector((state) =>
      selectSelectedColumnIdsByParentId(state, leftTableId)
    );

    // Get a list of selectedColumnIds in the right table
    const rightSelectedColumnsIds = useSelector((state) =>
      rightTableId ? selectSelectedColumnIdsByParentId(state, rightTableId) : []
    );

    const selectedOperationColumnIds = columnIds.filter((columnid) =>
      selectedColumnIds.includes(columnid)
    );

    // Get left and right table data to extract row counts
    const leftTable = useSelector((state) =>
      selectTablesById(state, leftTableId)
    );
    const leftRowCount = leftTable?.rowCount || 0;

    const rightTable = useSelector((state) =>
      selectTablesById(state, rightTableId)
    );
    const rightRowCount = rightTable?.rowCount || 0;

    // Extract row counts from table objects
    const selectedMatchTypes = useSelector(selectSelectedMatches);

    // Define callback functions
    // -------------------------------------------------------
    const setJoinType = useCallback(
      (joinType) => {
        dispatch(
          updateOperationsRequest({
            operationUpdates: [
              {
                id,
                joinType, // Update join type
              },
            ],
          })
        );
      },
      [dispatch, id]
    );

    const setMatchSelection = useCallback(
      (selectedMatches) => {
        dispatch(setSelectedMatches(selectedMatches));
      },
      [dispatch]
    );

    const clearMatchSelection = useCallback(
      () => dispatch(setSelectedMatches([])),
      [dispatch]
    );

    const setLeftTableJoinKey = useCallback(
      (columnId) => {
        dispatch(
          updateOperationsRequest({
            operationUpdates: [
              {
                id,
                joinKey1: columnId,
              },
            ],
          })
        );
      },
      [dispatch, id]
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
        dispatch(
          updateOperationsRequest({
            operationUpdates: [
              {
                id,
                joinKey2: columnId,
              },
            ],
          })
        );
      },
      [dispatch, id]
    );

    /**
     * Updates the join predicate for the current operation by dispatching an update action.
     *
     * @function
     * @param {any} joinPredicate - The new join predicate to set for the operation.
     * @returns {void}
     */
    const setJoinPredicateCallback = useCallback(
      (joinPredicate) => {
        dispatch(
          updateOperationsRequest({
            operationUpdates: [{ id, joinPredicate }],
          })
        );
      },
      [dispatch, id]
    );

    return (
      <WrappedComponent
        {...props}
        // Props defined in `withOperationData`
        id={id}
        childIds={childIds}
        columnIds={columnIds}
        selectedColumnIds={selectedColumnIds}
        activeChildColumnIds={activeChildColumnIds}
        selectedOperationColumnIds={selectedOperationColumnIds} // Should this be in an operation above? (TODO)
        joinPredicate={joinPredicate}
        // Props defined in this HOC `withPackOperationData`
        selectedMatchTypes={selectedMatchTypes}
        columnCount={columnCount}
        rowCount={rowCount}
        matchStats={matchStats}
        matchKeys={matchKeys}
        matchLabels={matchLabels}
        validMatchGroups={validMatchGroups}
        // Left table props
        leftTableId={leftTableId}
        leftKey={joinKey1}
        leftRowCount={leftRowCount} // TODO: are these needed, seems like table property
        leftColumnIds={leftColumnIds}
        leftColumnCount={leftColumnIds.length}
        leftSelectedColumns={leftSelectedColumnsIds}
        // Right table props
        rightKey={joinKey2}
        rightTableId={rightTableId}
        rightRowCount={rightRowCount} // TODO: are these needed, seems like table property
        tableToOpColumnMap={tableToOpColumnMap}
        rightColumnIds={rightColumnIds}
        rightColumnCount={rightColumnIds.length}
        rightSelectedColumns={rightSelectedColumnsIds}
        // Pack-specific join dispatchers
        setJoinType={setJoinType}
        setLeftTableJoinKey={setLeftTableJoinKey}
        setRightTableJoinKey={setRightTableJoinKey}
        setJoinPredicate={setJoinPredicateCallback}
        setMatchSelection={setMatchSelection}
        clearMatchSelection={clearMatchSelection}
      />
    );
  }

  // Wrap EnhancedPackComponent with withOperationData
  return withOperationData(EnhancedPackComponent);
}
