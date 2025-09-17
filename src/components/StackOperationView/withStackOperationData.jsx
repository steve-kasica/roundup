import { useSelector } from "react-redux";
import PropTypes from "prop-types";
import useOperationData from "../../hooks/useOperationData";
import { selectSelectedColumns } from "../../slices/columnsSlice";

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
    const { operation, columnIds, childrenIds, ...operationDataProps } =
      useOperationData(id);

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

    console.log("withStackOperationData", operationDataProps);

    return (
      <WrappedComponent
        operation={operation}
        columnIds={columnIds}
        childIds={childrenIds}
        columnIdMatrix={columnIdMatrix}
        selectedColumnIndices={selectedColumnIndices}
        m={m}
        n={n}
        {...operationDataProps}
        {...props}
      />
    );
  }
  EnhancedComponent.propTypes = {
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  };
  return EnhancedComponent;
}
