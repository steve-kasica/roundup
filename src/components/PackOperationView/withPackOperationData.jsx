import { useSelector, useDispatch } from "react-redux";
import { selectOperation } from "../../slices/operationsSlice";
import PropTypes from "prop-types";
import withOperationData from "../HOC/withOperationData";
import { useCallback, useMemo } from "react";
import { selectColumnIdsByTableId } from "../../slices/columnsSlice";
import {
  selectColumnById,
  selectSelectedColumns,
} from "../../slices/columnsSlice/columnSelectors";
import { selectTablesById } from "../../slices/tablesSlice";
import { updateColumnsRequest } from "../../sagas/updateColumnsSaga";
import { updateOperationsRequest } from "../../sagas/updateOperationsSaga";

export default function withPackOperationData(WrappedComponent) {
  // First wrap with the base operation data HOC
  const ComponentWithOperationData = withOperationData(WrappedComponent);

  function EnhancedPackComponent({ id, ...props }) {
    const dispatch = useDispatch();
    const operation = useSelector((state) => selectOperation(state, id));

    const columns = useSelector((state) =>
      selectColumnIdsByTableId(state, id).map((colId) =>
        selectColumnById(state, colId)
      )
    );

    const activeColumnIds = useMemo(
      () => columns.filter(({ isExcluded }) => !isExcluded).map(({ id }) => id),
      [columns]
    );

    const selectedColumnIds = useMemo(
      () =>
        columns
          .filter(({ isExcluded, isSelected }) => isSelected && !isExcluded)
          .map(({ id }) => id),
      [columns]
    );

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

    // Get all selected columns from Redux store
    const allSelectedColumns = useSelector(selectSelectedColumns);

    // Filter selected columns by left and right table IDs
    const leftSelectedColumns = allSelectedColumns.filter((columnId) => {
      const leftTableColumns = leftHandColumns || [];
      return leftTableColumns.includes(columnId);
    });

    const rightSelectedColumns = allSelectedColumns.filter((columnId) => {
      const rightTableColumns = rightHandColumns || [];
      return rightTableColumns.includes(columnId);
    });

    const selectedOperationColumnIds = operation.columnIds.filter((columnid) =>
      allSelectedColumns.includes(columnid)
    );

    // Get left and right table data to extract row counts
    const leftTable = useSelector((state) =>
      selectTablesById(state, operation?.children[0])
    );
    const rightTable = useSelector((state) =>
      selectTablesById(state, operation?.children[1])
    );

    // Extract row counts from table objects
    const leftRowCount = leftTable?.rowCount || 0;
    const rightRowCount = rightTable?.rowCount || 0;

    return (
      <ComponentWithOperationData
        {...props}
        id={id}
        columnCount={activeColumnIds.length}
        activeColumnIds={activeColumnIds}
        selectedColumnIds={selectedColumnIds}
        // Pack-specific props
        joinType={operation.joinType}
        joinPredicate={operation.joinPredicate}
        joinKey1={operation.joinKey1} // Deprecated, use leftKey
        leftKey={operation.joinKey1}
        leftKeyColumnName={leftKeyColumnName}
        joinKey2={operation.joinKey2} // Deprecated, use rightKey
        rightKey={operation.joinKey2}
        rightKeyColumnName={rightKeyColumnName}
        leftTableId={operation.children[0]}
        rightTableId={operation.children[1]}
        leftRowCount={leftRowCount}
        rightRowCount={rightRowCount}
        tableToOpColumnMap={tableToOpColumnMap}
        leftHandColumns={leftHandColumns} // Deprecated, use leftColumns
        leftColumns={leftHandColumns}
        rightHandColumns={rightHandColumns} // Deprecated, use rightColumns
        rightColumns={rightHandColumns}
        leftSelectedColumns={leftSelectedColumns}
        rightSelectedColumns={rightSelectedColumns}
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
        setName={(name) =>
          dispatch(
            updateOperationsRequest({ operationUpdates: [{ id, name }] })
          )
        }
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
        setOperationType={(operationType) =>
          dispatch(
            updateOperationsRequest({
              operationUpdates: [{ id, operationType }],
            })
          )
        }
        swapTablePositions={
          () => dispatch()
          // TODO
          // updateOperations({
          //   id,
          //   joinKey1: operation.joinKey2,
          //   joinKey2: operation.joinKey1,
          //   children: operation.children.slice().reverse(),
          // })
        }
        selectColumns={(columnIds) => {
          dispatch(
            updateColumnsRequest({
              columnUpdates: columnIds.map((id) => ({ id, isSelected: true })),
            })
          );
        }}
      />
    );
  }

  EnhancedPackComponent.propTypes = {
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  };

  return EnhancedPackComponent;
}

withPackOperationData.propTypes = {
  WrappedComponent: PropTypes.elementType.isRequired,
};
