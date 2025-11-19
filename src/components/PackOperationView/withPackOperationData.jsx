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

const matchEquality = (a, b) => a === b;
const matchContains = (a, b) => a.includes(b);
const matchStartsWith = (a, b) => a.startsWith(b);
const matchEndsWith = (a, b) => a.endsWith(b);

const matchFunctionMap = new Map([
  ["EQUALS", matchEquality],
  ["CONTAINS", matchContains],
  ["STARTS_WITH", matchStartsWith],
  ["ENDS_WITH", matchEndsWith],
]);

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
    // Props passed directly from parent
    ...props
  }) {
    const dispatch = useDispatch();

    const [leftTableId, rightTableId] = useMemo(() => childIds, [childIds]);

    const [leftColumnIds, rightColumnIds] = useMemo(
      () => activeChildColumnIds,
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
      selectSelectedColumnIdsByParentId(state, rightTableId)
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

    const leftValueCounts = useSelector(
      (state) => selectColumnsById(state, joinKey1)?.topValues
    );

    const rightValueCounts = useSelector(
      (state) => selectColumnsById(state, joinKey2)?.topValues
    );

    const matchStats = useMemo(() => {
      const stats = {
        matchingRowCount: 0,
        leftUnmatchedRowCount: 0,
        rightUnmatchedRowCount: 0,
      };
      const matchFunction = matchFunctionMap.get(joinPredicate);
      if (!joinPredicate || !leftValueCounts || !rightValueCounts) {
        return stats;
      }

      leftValueCounts.forEach(({ value: leftValue, count: leftCount }) => {
        const matches = rightValueCounts.filter(({ value: rightValue }) =>
          matchFunction(leftValue, rightValue)
        );
        if (matches.length > 0) {
          const totalRightMatches = matches.reduce(
            (sum, match) => sum + match.count,
            0
          );
          stats.matchingRowCount += leftCount * totalRightMatches;
        } else {
          stats.leftUnmatchedRowCount += leftCount;
        }
      });

      rightValueCounts.forEach(({ value: rightValue, count: rightCount }) => {
        const matches = leftValueCounts.filter(({ value: leftValue }) =>
          matchFunction(leftValue, rightValue)
        );
        if (matches.length === 0) {
          stats.rightUnmatchedRowCount += rightCount;
        }
      });

      return stats;
    }, [leftValueCounts, rightValueCounts, joinPredicate]);

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
        matchStats={matchStats}
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
