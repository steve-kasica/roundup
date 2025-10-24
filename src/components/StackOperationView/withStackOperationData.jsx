import { useDispatch, useSelector } from "react-redux";
import PropTypes from "prop-types";
import { useCallback, useMemo } from "react";
import {
  selectActiveColumnIdsByTableId,
  selectColumnIdMatrixByOperationId,
  selectColumnIdsByTableId,
  selectSelectedChildColumnsByOperationId,
  selectSelectedColumnDBNamesByTableId,
  selectSelectedColumnIdsByTableId,
  setFocusedColumnIds,
  setVisibleColumns as setVisibleColumnsAction,
} from "../../slices/columnsSlice";
import {
  selectOperation,
  selectOperationChildren,
  selectOperationDepth,
} from "../../slices/operationsSlice";
import { updateOperationsRequest } from "../../sagas/updateOperationsSaga";
import { updateColumnsRequest } from "../../sagas/updateColumnsSaga";
import {
  createColumnsRequest,
  CREATION_MODE_INSERTION,
} from "../../sagas/createColumnsSaga";

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
    console.log("withStackOperationData rendering", {
      id,
      component: WrappedComponent.displayName || WrappedComponent.name,
    });
    const dispatch = useDispatch();
    const operation = useSelector((state) => selectOperation(state, id));
    const depth = useSelector((state) => selectOperationDepth(state, id));

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

    const selectedColumnNames = useSelector((state) =>
      selectSelectedColumnDBNamesByTableId(state, id)
    );

    const columnIdMatrix = useSelector((state) =>
      selectColumnIdMatrixByOperationId(state, id)
    );

    const selectedChildColumns = useSelector((state) =>
      selectSelectedChildColumnsByOperationId(state, id)
    );

    // TODO: we really need to know whether or not a object is
    // a pack or stack from its ID. That'd be a good refactor.
    const childObjects = useSelector((state) =>
      selectOperationChildren(state, id)
    );

    // Memoized variables derived from selector results
    // ----------------------------------------------------------------------------

    const selectedColumnIndices = useMemo(() => {
      return selectedColumnIds
        .map((colId) => columnIds.indexOf(colId))
        .filter((index) => index !== -1);
    }, [columnIds, selectedColumnIds]);

    const [m, n] = useMemo(
      () => [
        Math.max(...columnIdMatrix.map((c) => c.length), 0),
        columnIdMatrix.length,
      ],
      [columnIdMatrix]
    );

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
    // -------------------------------------
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

    const insertColumnIntoChildAtIndex = useCallback(
      (childTableId, targetIndex) => {
        dispatch(
          createColumnsRequest({
            mode: CREATION_MODE_INSERTION,
            columnInfo: [{ parentId: childTableId, index: targetIndex }],
          })
        );
      },
      [dispatch]
    );

    const setVisibleColumns = useCallback(
      (columnIds) => {
        dispatch(setVisibleColumnsAction(columnIds));
      },
      [dispatch]
    );

    return (
      <WrappedComponent
        // Props related to the operation itself
        operation={operation}
        childObjects={childObjects}
        depth={depth}
        // Props related to the operation's columns
        columnIds={columnIds}
        activeColumnIds={activeColumnIds}
        selectedColumnIds={selectedColumnIds}
        selectedColumnNames={selectedColumnNames}
        selectedColumnIndices={selectedColumnIndices}
        selectedChildColumns={selectedChildColumns} // is map {childId: [cols]}
        columnCount={activeColumnIds.length}
        rowCount={operation.rowCount}
        // Props related to the operation's children tables
        columnIdMatrix={columnIdMatrix}
        m={m}
        n={n}
        selectedTableIds={selectedTableIds}
        selection={selection}
        // Callback props to dispatch actions
        setVisibleColumns={setVisibleColumns}
        selectColumns={selectColumns}
        insertColumnIntoChildAtIndex={insertColumnIntoChildAtIndex}
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
