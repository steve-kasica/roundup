/* eslint-disable react/prop-types */
import { useDispatch, useSelector } from "react-redux";
import { useMemo } from "react";
import { selectStackOperationRowRanges } from "../../slices/operationsSlice";
import { updateColumnsRequest } from "../../sagas/updateColumnsSaga";
import withOperationData from "../HOC/withOperationData";
import {
  selectStackOperationRowCount,
  selectStackOperationColumnCount,
} from "../../slices/operationsSlice";
import { selectTableColumnIds } from "../../slices/tablesSlice";

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
  function EnhancedComponent({
    // Props passed from withOperationData
    operation,
    columnIds,
    selectedColumnIds,
    childIds,
    // Props passed from withAssociatedAlerts
    alertIds,
    hasAlerts,
    removeAlerts,
    silenceAlerts,
    // Props passed directly from parent
    id,
    ...props
  }) {
    const dispatch = useDispatch();

    // Returns a matrix of columnIDs, ordered by child table IDs
    const childColumnIds = useSelector((state) =>
      selectTableColumnIds(state, childIds)
    );

    const columnIdMatrix = useMemo(() => {
      const maxLength = Math.max(...childColumnIds.map((row) => row.length), 0);
      const backfilledMatrix = childColumnIds.map((row) => {
        if (row.length < maxLength) {
          return [...row, ...Array(maxLength - row.length).fill(null)];
        }
        return row;
      });
      return backfilledMatrix;
    }, [childColumnIds]);

    // TODO: we really need to know whether or not a object is
    // a pack or stack from its ID. That'd be a good refactor.

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

    const columnCount = useSelector((state) => {
      return (
        operation.columnCount || selectStackOperationColumnCount(state, id)
      );
    });

    const rowCount = useSelector((state) => {
      return operation.rowCount || selectStackOperationRowCount(state, id);
    });

    const rowRanges = useSelector((state) =>
      selectStackOperationRowRanges(state, id)
    );

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

    return (
      <WrappedComponent
        // Pass along props directly from the parent component
        {...props}
        // Props from withOperationData
        id={id}
        operation={operation}
        columnIds={columnIds}
        selectedColumnIds={selectedColumnIds}
        // Props specific to Stack operations
        childObjects={null} // TODO delete
        rowCount={rowCount}
        columnCount={columnCount}
        rowRanges={rowRanges}
        // Props related to the operation's columns
        selectedColumnIndices={selectedColumnIndices}
        // Props related to the operation's children tables
        columnIdMatrix={columnIdMatrix}
        m={m}
        n={n}
        selectedTableIds={selectedTableIds}
        selection={selection}
        // Props related to associated alerts
        alertIds={alertIds}
        hasAlerts={hasAlerts}
        removeAlerts={removeAlerts}
        silenceAlerts={silenceAlerts}
        // Callback props to dispatch actions
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
      />
    );
  }

  // Wrap EnhancedComponent with withOperationData
  return withOperationData(EnhancedComponent);
}
