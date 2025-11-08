/* eslint-disable react/prop-types */
import { useSelector, useDispatch } from "react-redux";
import withOperationData from "../HOC/withOperationData";
import { useCallback } from "react";
import { selectColumnIdsByTableId } from "../../slices/columnsSlice";
import {
  selectColumnById,
  selectSelectedColumnIdsByTableId,
} from "../../slices/columnsSlice/columnSelectors";
import { selectTablesById } from "../../slices/tablesSlice";
import { updateOperationsRequest } from "../../sagas/updateOperationsSaga";
import { setSelectedMatches } from "../../slices/uiSlice";
import {
  selectPackOperationColumnCount,
  selectPackOperationMatchStats,
} from "../../slices/operationsSlice/operationsSelectors";
export default function withPackOperationData(WrappedComponent) {
  function EnhancedPackComponent({
    // Props passed from withOperationData
    operation,
    selectedColumnIds,
    // Props passed directly from parent
    id,
    ...props
  }) {
    const dispatch = useDispatch();

    const leftTableId = operation?.children[0];
    const rightTableId = operation?.children[1];

    const [leftKeyColumnName, rightKeyColumnName] = useSelector((state) => {
      const leftKeyColumn = selectColumnById(state, operation?.joinKey1);
      const rightKeyColumn = selectColumnById(state, operation?.joinKey2);
      return [leftKeyColumn?.columnName, rightKeyColumn?.columnName];
    });

    const leftHandColumns = useSelector((state) =>
      selectColumnIdsByTableId(state, operation?.children[0])
    );
    const rightHandColumns = useSelector((state) =>
      selectColumnIdsByTableId(state, operation?.children[1])
    );

    const columnCount = useSelector((state) =>
      selectPackOperationColumnCount(state, id)
    );

    const rowCount = operation.rowCount;

    const tableToOpColumnMap = new Map();
    leftHandColumns.forEach((colId, i) => {
      tableToOpColumnMap.set(colId, {
        columnId: operation.columnIds[i],
        tableId: operation.children[0],
      });
    });
    rightHandColumns.forEach((colId, i) => {
      tableToOpColumnMap.set(colId, {
        columnId: operation.columnIds[i + (leftHandColumns?.length || 0)],
        tableId: operation.children[1],
      });
    });

    // Get a list of selectedColumnIds in the left table
    const leftSelectedColumnsIds = useSelector((state) =>
      selectSelectedColumnIdsByTableId(state, leftTableId)
    );

    // Get a list of selectedColumnIds in the right table
    const rightSelectedColumnsIds = useSelector((state) =>
      selectSelectedColumnIdsByTableId(state, rightTableId)
    );

    const selectedOperationColumnIds = operation.columnIds.filter((columnid) =>
      selectedColumnIds.includes(columnid)
    );

    // Get left and right table data to extract row counts
    const leftTable = useSelector((state) =>
      selectTablesById(state, leftTableId)
    );

    const rightTable = useSelector((state) =>
      selectTablesById(state, rightTableId)
    );

    const matchStats = useSelector((state) =>
      selectPackOperationMatchStats(state, id)
    );

    // Props derived form selector results
    // -------------------------------------------------------

    // Extract row counts from table objects
    const leftRowCount = leftTable?.rowCount || 0;
    const rightRowCount = rightTable?.rowCount || 0;

    const selectedMatchTypes = useSelector((state) => state.ui.selectedMatches);

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

    return (
      <WrappedComponent
        {...props}
        // General operation props
        id={id}
        operation={operation}
        childIds={operation.children}
        name={operation.name}
        selectedOperationColumnIds={selectedOperationColumnIds} // Should this be in an operation above? (TODO)
        // Props specific to Pack operations
        joinType={operation.joinType}
        joinPredicate={operation.joinPredicate}
        selectedMatchTypes={selectedMatchTypes}
        columnCount={columnCount}
        rowCount={rowCount}
        matchStats={matchStats}
        // Left table props
        leftTableId={leftTableId}
        joinKey1={operation.joinKey1} // Deprecated, use leftKey
        leftKey={operation.joinKey1}
        leftKeyColumnName={leftKeyColumnName}
        leftRowCount={leftRowCount} // TODO: are these needed, seems like table property
        leftHandColumns={leftHandColumns} // Deprecated, use leftColumns
        leftColumns={leftHandColumns}
        leftSelectedColumns={leftSelectedColumnsIds}
        // Right table props
        joinKey2={operation.joinKey2} // Deprecated, use rightKey
        rightKey={operation.joinKey2}
        rightKeyColumnName={rightKeyColumnName}
        rightTableId={rightTableId}
        rightRowCount={rightRowCount} // TODO: are these needed, seems like table property
        tableToOpColumnMap={tableToOpColumnMap}
        rightHandColumns={rightHandColumns} // Deprecated, use rightColumns
        rightColumns={rightHandColumns}
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
