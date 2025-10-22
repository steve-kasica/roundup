import { useDispatch, useSelector } from "react-redux";
import PropTypes from "prop-types";
import { useCallback, useMemo } from "react";
import {
  selectActiveColumnIdsByTableId,
  selectColumnById,
  selectColumnIdMatrixByOperationId,
  selectColumnIdsByTableId,
  selectSelectedColumnDBNamesByTableId,
  selectSelectedColumnIdsByTableId,
  setFocusedColumnIds,
} from "../../slices/columnsSlice";
import {
  selectOperation,
  selectOperationChildrenData,
  selectOperationDepth,
} from "../../slices/operationsSlice";
import { updateOperationsRequest } from "../../sagas/updateOperationsSaga";
import { updateColumnsRequest } from "../../sagas/updateColumnsSaga";

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
  const componentName =
    WrappedComponent.displayName || WrappedComponent.name || "Component";

  function EnhancedComponent({ id, ...props }) {
    const dispatch = useDispatch();
    const operation = useSelector((state) => selectOperation(state, id));
    const depth = useSelector((state) => selectOperationDepth(state, id));
    const children = useSelector((state) =>
      selectOperationChildrenData(state, id)
    );

    const columnIds = useSelector((state) =>
      selectColumnIdsByTableId(state, id)
    );

    const activeColumnIds = useSelector((state) =>
      selectActiveColumnIdsByTableId(state, id)
    );

    // Column objects for all columns associated directly with this operation
    const selectedColumnIds = useSelector((state) =>
      selectSelectedColumnIdsByTableId(state, id)
    );

    const selectedColumnIndices = useMemo(() => {
      return selectedColumnIds
        .map((colId) => columnIds.indexOf(colId))
        .filter((index) => index !== -1);
    }, [columnIds, selectedColumnIds]);

    const selectedColumnNames = useSelector((state) =>
      selectSelectedColumnDBNamesByTableId(state, id)
    );

    const columnIdMatrix = useSelector((state) =>
      selectColumnIdMatrixByOperationId(state, id)
    );

    const m = Math.max(...columnIdMatrix.map((c) => c.length), 0);
    const n = columnIdMatrix.length;

    const selection = useMemo(() => {
      return operation.children
        .map((tableId, rowIndex) => ({
          tableId,
          columnIds: columnIdMatrix[rowIndex].filter((columnId) =>
            selectedColumnIds.includes(columnId)
          ),
        }))
        .filter(({ columnIds }) => columnIds.length > 0);
    }, [operation.children, columnIdMatrix, selectedColumnIds]);

    const selectedTableIds = useMemo(() => {
      return columnIdMatrix
        .map((row, rowIndex) =>
          row.some(
            (columnId) => columnId && selectedColumnIds.includes(columnId)
          )
            ? rowIndex
            : null
        )
        .filter((index) => index !== null)
        .map((index) => operation.children[index]);
    }, [columnIdMatrix, operation.children, selectedColumnIds]);

    // Define callback functions
    const selectColumns = useCallback(
      (selectedColumnIds) =>
        dispatch(
          updateColumnsRequest({
            columnUpdates: [
              ...selectedColumnIds.filter(Boolean).map((id) => ({
                id,
                isSelected: true,
              })),
            ],
          })
        ),
      [dispatch]
    );

    return (
      <WrappedComponent
        // Props related to the operation itself
        operation={operation}
        children={children}
        depth={depth}
        // Props related to the operation's columns
        columnIds={columnIds}
        activeColumnIds={activeColumnIds}
        selectedColumnIds={selectedColumnIds}
        selectedColumnNames={selectedColumnNames}
        selectedColumnIndices={selectedColumnIndices}
        columnCount={activeColumnIds.length}
        rowCount={operation.rowCount}
        // Props related to the operation's children tables
        columnIdMatrix={columnIdMatrix}
        m={m}
        n={n}
        selectedTableIds={selectedTableIds}
        selection={selection}
        // Callback props to dispatch actions
        selectColumns={selectColumns}
        swapColumns={(target, source) => {
          const tableColumnIds =
            columnIdMatrix[operation.children.indexOf(target.tableId)];
          const sourceIndex = tableColumnIds.indexOf(source.id);
          const targetIndex = tableColumnIds.indexOf(target.id);

          dispatch(
            updateColumnsRequest({
              columnUpdates: [
                { id: source.id, index: targetIndex },
                { id: target.id, index: sourceIndex },
              ],
            })
          );
        }}
        focusColumns={(colIds) => dispatch(setFocusedColumnIds(colIds))}
        setOperationType={(operationType) =>
          dispatch(
            updateOperationsRequest({
              operationUpdates: [
                {
                  id,
                  operationType,
                },
              ],
            })
          )
        }
        setName={(name) =>
          dispatch(
            updateOperationsRequest({ operationUpdates: [{ id, name }] })
          )
        }
        {...props}
      />
    );
  }
  EnhancedComponent.propTypes = {
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  };
  return EnhancedComponent;
}
