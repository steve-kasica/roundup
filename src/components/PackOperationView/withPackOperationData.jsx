/* eslint-disable react/prop-types */
import { useSelector, useDispatch } from "react-redux";
import withOperationData from "../HOC/withOperationData";
import { useCallback, useMemo } from "react";
import {
  selectActiveColumnIdsByParentId,
  selectColumnsById,
  selectSelectedColumnIdsByParentId,
} from "../../slices/columnsSlice/selectors";
import { selectTablesById } from "../../slices/tablesSlice";
import { updateOperationsRequest } from "../../sagas/updateOperationsSaga";
import {
  setSelectedMatches,
  selectSelectedMatches,
} from "../../slices/uiSlice";
import { selectPackOperationMatchStats } from "../../slices/operationsSlice";

export default function withPackOperationData(WrappedComponent) {
  function EnhancedPackComponent({
    // Props passed from withOperationData
    id,
    joinKey1,
    joinKey2,
    childIds,
    columnIds,
    selectedColumnIds,
    // Props passed directly from parent
    ...props
  }) {
    const dispatch = useDispatch();

    const [leftTableId, rightTableId] = useMemo(() => childIds, [childIds]);

    const childColumnIds = useSelector((state) =>
      selectActiveColumnIdsByParentId(state, childIds)
    );

    const [leftColumnIds, rightColumnIds] = useMemo(
      () => childColumnIds,
      [childColumnIds]
    );

    const columnCount = useMemo(
      () => childColumnIds.reduce((a, b) => a + b.length, 0),
      [childColumnIds]
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

    const matchStats = useSelector((state) =>
      selectPackOperationMatchStats(state, id)
    );

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
    console.log("EnhancedPackComponent render", {
      leftColumnIds,
      rightColumnIds,
      columnCount,
    });

    return (
      <WrappedComponent
        {...props}
        // Props via withOperationData
        id={id}
        childIds={childIds}
        columnIds={columnIds}
        selectedColumnIds={selectedColumnIds}
        selectedOperationColumnIds={selectedOperationColumnIds} // Should this be in an operation above? (TODO)
        // Props specific to Pack operations
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
      />
    );
  }

  // Wrap EnhancedPackComponent with withOperationData
  return withOperationData(EnhancedPackComponent);
}
