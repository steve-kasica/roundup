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
import { updateColumnsRequest } from "../../sagas/updateColumnsSaga";
import { updateOperationsRequest } from "../../sagas/updateOperationsSaga";

export default function withPackOperationData(WrappedComponent) {
  function EnhancedPackComponent({
    // Props passed from withOperationData
    operation,
    activeColumnIds,
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

    const leftHandColumns = useSelector((state) =>
      selectColumnIdsByTableId(state, operation?.children[0])
    );
    const rightHandColumns = useSelector((state) =>
      selectColumnIdsByTableId(state, operation?.children[1])
    );

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

    // Extract row counts from table objects
    const leftRowCount = leftTable?.rowCount || 0;
    const rightRowCount = rightTable?.rowCount || 0;

    return (
      <WrappedComponent
        {...props}
        // Pack-specific props
        joinType={operation.joinType}
        joinPredicate={operation.joinPredicate}
        joinKey1={operation.joinKey1} // Deprecated, use leftKey
        leftKey={operation.joinKey1}
        leftKeyColumnName={leftKeyColumnName}
        joinKey2={operation.joinKey2} // Deprecated, use rightKey
        rightKey={operation.joinKey2}
        rightKeyColumnName={rightKeyColumnName}
        leftTableId={leftTableId}
        rightTableId={rightTableId}
        leftRowCount={leftRowCount} // TODO: are these needed, seems like table property
        rightRowCount={rightRowCount} // TODO: are these needed, seems like table property
        tableToOpColumnMap={tableToOpColumnMap}
        leftHandColumns={leftHandColumns} // Deprecated, use leftColumns
        leftColumns={leftHandColumns}
        rightHandColumns={rightHandColumns} // Deprecated, use rightColumns
        rightColumns={rightHandColumns}
        leftSelectedColumns={leftSelectedColumnsIds}
        rightSelectedColumns={rightSelectedColumnsIds}
        selectedOperationColumnIds={selectedOperationColumnIds}
        // Pack-specific join dispatchers
        setJoinType={setJoinType}
        setLeftTableJoinKey={(columnId) => {
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
        }}
        setRightTableJoinKey={(columnId) =>
          dispatch(
            updateOperationsRequest({
              operationUpdates: [
                {
                  id,
                  joinKey2: columnId,
                },
              ],
            })
          )
        }
        setJoinPredicate={(joinPredicate) =>
          dispatch(
            updateOperationsRequest({
              operationUpdates: [{ id, joinPredicate }],
            })
          )
        }
      />
    );
  }

  // Wrap EnhancedPackComponent with withOperationData
  return withOperationData(EnhancedPackComponent);
}
