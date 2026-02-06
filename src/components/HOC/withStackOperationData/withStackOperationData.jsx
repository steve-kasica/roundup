/**
 * @fileoverview Higher-order component to provide stack operation data
 * to wrapped components. This HOC connects to the Redux store to
 * retrieve and compute relevant data about stack operations, including
 * child table column IDs, matrix dimensions, and row ranges.
 *
 * The principle export from this component is a rectangular matrix of
 * column IDs for each child table, with null values used to backfill
 * shorter rows to ensure a consistent shape. This matrix is useful
 * for rendering stack operation UIs where columns may need to be
 * manipulated across multiple child tables.
 *
 * @module components/HOC/withStackOperationData
 */
import { useDispatch, useSelector } from "react-redux";
import { useCallback, useMemo } from "react";
import {
  OPERATION_TYPE_STACK,
  selectOperationsById,
  selectStackOperationRowRanges,
} from "../../../slices/operationsSlice";
import { updateTablesRequest } from "../../../sagas/updateTablesSaga";
import { selectColumnIdsByParentId } from "../../../slices/columnsSlice";
import { getColumnIdMatrix, getRowCount } from "./utilities";

/**
 * @typedef {Object} WithStackOperationDataProps
 * @property {string} id - The ID of the stack operation
 * @property {number} columnCount - Number of columns in the stack operation
 * @property {Array<Array<string|null>>} columnIdMatrix - 2D array of column IDs with nulls
 * @property {number} m - Number of columns in the column ID matrix
 * @property {number} n - Number of rows in the column ID matrix
 * @property {Map<string, {start: number, end: number}>} rowRanges - Map of table ID to row range
 * @property {number} rowCount - Number of rows in the stack operation
 * @property {function} swapColumns - Function to swap two columns in child tables
 */

/**
 * @function withStackOperationData
 * @template T
 * @param {React.ComponentType<WithStackOperationDataProps>} WrappedComponent
 * @returns {React.ComponentType<Omit<WithStackOperationDataProps, 'columnIdMatrix' | 'm' | 'n' | 'swapColumns' | 'columnCount' | 'rowRanges' | 'rowCount'>>} Enhanced component with stack operation data
 */
export default function withStackOperationData(WrappedComponent) {
  function EnhancedComponent({ id, ...props }) {
    const dispatch = useDispatch();
    const operation = useSelector((state) => selectOperationsById(state, id));

    /**
     * Get the column IDs for each child table of the stack operation
     * @returns {Array<Array<string>>} 2D array of column IDs per child table
     */
    const childColumnIds = useSelector((state) =>
      selectColumnIdsByParentId(state, operation.childIds),
    );

    // Child Columns
    // ----------------------------------------------------------------------------

    /**
     * Construct a backfilled column ID matrix where each row
     * corresponds to a child table and each column corresponds
     * to a column index within that table. Rows are backfilled
     * with null values to ensure rectangular shape.
     *
     * @example
     *  [
     *    [ c1, c2, c3,    c4    ],
     *    [ c5, c6, c7,    null  ],
     *    [ c8, c9, null,  null  ]
     *  ]
     *
     * @returns {Array<Array<string|null>>} 2D array of column IDs with nulls
     */
    const columnIdMatrix = useMemo(
      () => getColumnIdMatrix(childColumnIds),
      [childColumnIds],
    );

    /**
     * Calculate matrix dimensions: m (columns), n (rows)
     */
    const [m, n] = useMemo(
      () => [
        Math.max(...columnIdMatrix.map((c) => c.length), 0),
        columnIdMatrix.length,
      ],
      [columnIdMatrix],
    );

    /**
     * @function swapColumns
     *
     * Swap two columns in the stack operation's child tables
     * @param {{id: string, parentId: string}} target - The target column to swap
     * @param {{id: string, parentId: string}} source - The source column to swap
     */
    const swapColumns = useCallback(
      (target, source) => {
        const tableColumnIds = [
          ...childColumnIds[operation.childIds.indexOf(target.parentId)],
        ];
        const sourceIndex = tableColumnIds.indexOf(source.id);
        const targetIndex = tableColumnIds.indexOf(target.id);

        const columnIds = tableColumnIds.map((colId, index) => {
          if (index === targetIndex) return source.id;
          if (index === sourceIndex) return target.id;
          return colId;
        });

        dispatch(
          updateTablesRequest([
            {
              id: target.parentId,
              columnIds,
            },
          ]),
        );
      },
      [childColumnIds, operation.childIds, dispatch],
    );

    // Table dimensions
    // ----------------------------------------------------------------------------

    /**
     * Calculate the number of columns in the stack operation.
     * Derive the column count from the maximum number of columns
     * in the child tables.
     * @returns {number} The number of columns in the stack operation
     */
    const columnCount = useMemo(() => {
      if (operation?.isInSync && operation?.columnCount >= 0) {
        return operation.columnCount;
      } else if (operation?.columnIds?.length > 0) {
        return operation.columnIds.length;
      } else if (childColumnIds?.length > 0) {
        return Math.max(
          ...childColumnIds.map((columnIds) => columnIds.length),
          0,
        );
      } else {
        return undefined;
      }
    }, [
      operation?.isInSync,
      operation?.columnCount,
      operation?.columnIds,
      childColumnIds,
    ]);

    /**
     * Get the row ranges for each child table in the stack operation
     * @returns {Map<string, {start: number, end: number}>} Map of table ID to row range
     */
    const rowRanges = useSelector((state) =>
      selectStackOperationRowRanges(state, id),
    );

    /**
     * Calculate the number of rows in the stack operation.
     * When we materialize a table, we get its dimensions and
     * store them in the operation. But until we create the table
     * we may need to estimate the row count from the rowRanges.
     * @returns {number} The number of rows in the stack operation
     */
    const rowCount = useMemo(
      () => getRowCount(operation.rowCount, rowRanges),
      [operation.rowCount, rowRanges],
    );

    return (
      <WrappedComponent
        id={id}
        // Metadata
        operationType={OPERATION_TYPE_STACK}
        // Child columns
        columnIdMatrix={columnIdMatrix}
        m={m}
        n={n}
        swapColumns={swapColumns}
        // Table dimensions
        columnCount={columnCount}
        rowRanges={rowRanges}
        rowCount={rowCount}
        {...props}
      />
    );
  }

  EnhancedComponent.displayName = `withStackOperationData(${
    WrappedComponent.displayName || WrappedComponent.name || "Component"
  })`;

  return EnhancedComponent;
}
