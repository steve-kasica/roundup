import { useDispatch, useSelector } from "react-redux";
import PropTypes from "prop-types";
import useOperationData from "../../hooks/useOperationData";
import {
  selectRemovedColumnIdsByTableId,
  selectSelectedColumns,
  setSelectedColumns,
} from "../../slices/columnsSlice";
import {
  selectFocusedOperationId,
  selectHoveredOperation,
  selectOperation,
  selectOperationDepth,
} from "../../slices/operationsSlice";

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
    const focusedOperationId = useSelector(selectFocusedOperationId);
    const hoveredOperationId = useSelector(selectHoveredOperation);
    const columnIds = useSelector((state) =>
      selectRemovedColumnIdsByTableId(state, id)
    );
    const removedColumnIds = useSelector((state) =>
      selectRemovedColumnIdsByTableId(state, id)
    );

    // const activeColumnIds = useMemo(
    //   () =>
    //     columnIds.filter((columnId) => !removedColumnIds.includes(columnId)),
    //   [columnIds, removedColumnIds]
    // );
    const childrenIds = operation.children;

    const droppedColumnIds = useSelector((state) => state.columns.dropped);

    const columnIdMatrix = useSelector((state) => {
      // TODO: what if the childId is not a table?
      const rawColumnIds = (operation?.children || []).map((childId) =>
        (state.columns.idsByTable[childId] || []).filter(
          (cid) => !droppedColumnIds.includes(cid)
        )
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
    const selectedColumns = useSelector(selectSelectedColumns);
    const selectedColumnIndices = columnIds.map((colId) =>
      selectedColumns.includes(colId) ? true : false
    );

    return (
      <WrappedComponent
        operation={operation}
        depth={depth}
        columnIdMatrix={columnIdMatrix}
        selectedColumnIndices={selectedColumnIndices}
        m={m}
        n={n}
        selectColumns={(colIds) => dispatch(setSelectedColumns(colIds))}
        {...props}
      />
    );
  }
  EnhancedComponent.propTypes = {
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  };
  return EnhancedComponent;
}
