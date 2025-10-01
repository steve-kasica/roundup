import { useSelector, useDispatch } from "react-redux";
import {
  selectOperation,
  OPERATION_TYPE_PACK,
  updateOperations,
} from "../../slices/operationsSlice";
import PropTypes from "prop-types";
import withOperationData from "../HOC/withOperationData";
import { useCallback } from "react";
import {
  selectColumnIdsByTableId,
  setSelectedColumns,
} from "../../slices/columnsSlice";
import {
  selectColumnById,
  selectSelectedColumns,
} from "../../slices/columnsSlice/columnSelectors";
import { selectTablesById } from "../../slices/tablesSlice";

export default function withPackOperationData(WrappedComponent) {
  // First wrap with the base operation data HOC
  const ComponentWithOperationData = withOperationData(WrappedComponent);

  function EnhancedPackComponent({ id, ...props }) {
    const dispatch = useDispatch();
    const operation = useSelector((state) => selectOperation(state, id));

    // Pack-specific data
    const isPack = operation?.operationType === OPERATION_TYPE_PACK;

    const setJoinType = useCallback(
      (joinType) => {
        dispatch(
          updateOperations({
            id,
            joinType, // Update join type
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

    const selectedOperationColumnIds = useSelector((state) => {
      const selectedTableColumnIds = [
        ...leftSelectedColumns,
        ...rightSelectedColumns,
      ];
      console.log("selectedTableColumnIds:", selectedTableColumnIds);
      return operation.columnIds.filter((columnId) => {
        const operationColumn = selectColumnById(state, columnId);
        console.log("operationColumn:", operationColumn, columnId);
        return selectedTableColumnIds.includes(operationColumn?.children[0]);
      });
    });

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
        // Pack-specific props
        joinType={operation.joinType}
        joinPredicate={operation.joinPredicate}
        joinKey1={operation.joinKey1} // Deprecated, use leftKey
        leftKey={operation.joinKey1}
        joinKey2={operation.joinKey2} // Deprecated, use rightKey
        rightKey={operation.joinKey2}
        leftTableId={operation.children[0]}
        rightTableId={operation.children[1]}
        leftRowCount={leftRowCount}
        rightRowCount={rightRowCount}
        isPack={isPack}
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
            updateOperations({
              id,
              joinKey1: columnId,
            })
          );
        }}
        setName={(name) => dispatch(updateOperations({ id, name }))}
        setRightTableJoinKey={(columnId) =>
          dispatch(
            updateOperations({
              id,
              joinKey2: columnId,
            })
          )
        }
        setJoinPredicate={(joinPredicate) =>
          dispatch(updateOperations({ id, joinPredicate }))
        }
        setOperationType={(operationType) =>
          dispatch(updateOperations({ id, operationType }))
        }
        swapTablePositions={() =>
          dispatch(
            updateOperations({
              id,
              joinKey1: operation.joinKey2,
              joinKey2: operation.joinKey1,
              children: operation.children.slice().reverse(),
            })
          )
        }
        selectColumns={useCallback(
          (columnIds) => {
            dispatch(setSelectedColumns(columnIds));
          },
          [dispatch]
        )}
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
