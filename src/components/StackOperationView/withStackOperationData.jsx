import { useDispatch, useSelector } from "react-redux";
import PropTypes from "prop-types";
import { useMemo } from "react";
import useOperationData from "../../hooks/useOperationData";
import {
  selectRemovedColumnIdsByTableId,
  selectSelectedColumns,
  setFocusedColumns,
  setSelectedColumns,
} from "../../slices/columnsSlice";
import {
  selectFocusedOperationId,
  selectHoveredOperation,
  selectOperation,
  selectOperationDepth,
  updateOperations,
} from "../../slices/operationsSlice";
import { updateOperationsRequest } from "../../sagas/updateOperationsSaga";
import { selectTablesById } from "../../slices/tablesSlice";
import { group } from "d3";

// TODO: how to handle the case when tableIds are actually
// operation Ids? Well, I guess a operation
// would just be a view?
/**
 * This HOC produces a matrix of column IDs for each table ID provided
 * in row-major order while filling uneven rows, which represent
 * tables with different numbers of columns, with null values to ensure
 * that the matrix is rectangular. For example,
 *
 *  [
 *    [ c1, c2, c3,    c4    ],
 *    [ c5, c6, c7,    null  ],
 *    [ c8, c9, null,  null  ]
 *  ]
 *
 * It also passes, on via props, some useful metadata about
 * the matrix: the number of rows (n),  columns (m), and column names.
 * @param {*} WrappedComponent
 * @returns
 */
export default function withStackOperationData(WrappedComponent) {
  function EnhancedComponent({ id, ...props }) {
    const dispatch = useDispatch();
    const operation = useSelector((state) => selectOperation(state, id));
    const depth = useSelector((state) => selectOperationDepth(state, id));
    const columnIds = useSelector((state) =>
      selectRemovedColumnIdsByTableId(state, id)
    );
    const selectedColumns = useSelector(selectSelectedColumns);

    const columnIdMatrix = useSelector((state) => {
      // TODO: what if the childId is not a table?
      const rawColumnIds = (operation?.children || []).map(
        (childId) => selectTablesById(state, childId).columnIds
      );
      const maxLength = Math.max(...rawColumnIds.map((row) => row.length), 0);
      return rawColumnIds.map((row) => {
        if (row.length < maxLength) {
          return [...row, ...Array(maxLength - row.length).fill(null)];
        }
        return row;
      });
    });

    const m = Math.max(...columnIdMatrix.map((c) => c.length), 0);
    const n = columnIdMatrix.length;
    const selectedOperationColumnIds = useMemo(() => {
      return operation.columnIds.filter((columnId) =>
        selectedColumns.includes(columnId)
      );
    }, [operation.columnIds, selectedColumns]);
    const selectedColumnIndices = useMemo(() => {
      return selectedOperationColumnIds
        .map((colId) => operation.columnIds.indexOf(colId))
        .filter((index) => index !== -1);
    }, [operation.columnIds, selectedOperationColumnIds]);

    const selection = useMemo(() => {
      return operation.children
        .map((tableId, rowIndex) => ({
          tableId,
          columnIds: columnIdMatrix[rowIndex].filter((columnId) =>
            selectedColumns.includes(columnId)
          ),
        }))
        .filter(({ columnIds }) => columnIds.length > 0);
    }, [operation.children, columnIdMatrix, selectedColumns]);

    const selectedTableIds = useMemo(() => {
      return columnIdMatrix
        .map((row, rowIndex) =>
          row.some((columnId) => columnId && selectedColumns.includes(columnId))
            ? rowIndex
            : null
        )
        .filter((index) => index !== null)
        .map((index) => operation.children[index]);
    }, [columnIdMatrix, operation.children, selectedColumns]);

    const selectedColumnIds = useMemo(() => {
      return columnIdMatrix
        .map((row) =>
          row.filter((columnId) => selectedColumns.includes(columnId))
        )
        .filter((columnIds) => columnIds.length > 0);
    }, [columnIdMatrix, selectedColumns]);

    return (
      <WrappedComponent
        operation={operation}
        depth={depth}
        columnIdMatrix={columnIdMatrix}
        selectedColumnIndices={selectedColumnIndices}
        selectedOperationColumnIds={selectedOperationColumnIds}
        selectedTableIds={selectedTableIds}
        selectedColumnIds={selectedColumnIds}
        selection={selection}
        m={m}
        n={n}
        selectColumns={(colIds) => dispatch(setSelectedColumns(colIds))}
        swapColumns={(target, source) => {
          const updatedColumnIds = [...operation.columnIds];
          const sourceIndex = updatedColumnIds.indexOf(source);
          const targetIndex = updatedColumnIds.indexOf(target);
          if (sourceIndex === -1 || targetIndex === -1) return; // Invalid indices

          // Remove source columnId from its original position
          updatedColumnIds.splice(sourceIndex, 1);
          // Insert source columnId at the target position
          updatedColumnIds.splice(targetIndex, 0, source);

          if (sourceIndex !== targetIndex) {
            dispatch(
              updateOperationsRequest({
                id,
                columnIds: updatedColumnIds,
              })
            );
          }
        }}
        focusColumns={(colIds) => dispatch(setFocusedColumns(colIds))}
        selectedColumns={selectedColumns}
        setOperationType={(operationType) =>
          dispatch(
            updateOperations({
              id,
              operationType,
            })
          )
        }
        setName={(name) => dispatch(updateOperations({ id, name }))}
        {...props}
      />
    );
  }
  EnhancedComponent.propTypes = {
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  };
  return EnhancedComponent;
}
