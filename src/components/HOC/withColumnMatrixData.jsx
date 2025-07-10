import { useSelector } from "react-redux";
import PropTypes from "prop-types";

// TODO: how to handlethe case when tableIds are actually
// operation Ids? Well, I guess a operation
// would just be a view?
/**
 * This HOC produces a matrix of column IDs for each table ID provided
 * in row-major order. It will fill uneven row lengths, which represent
 * tables with different numbers of columns, with null values to ensure
 * that the matrix is rectangular. It also passes on some useful metadata about
 * the matrix, such as the number of rows (n) and columns (m).
 * @param {*} WrappedComponent
 * @returns
 */
export default function withColumnMatrixData(WrappedComponent) {
  function EnhancedComponent({ childrenIds, ...props }) {
    const columnIdMatrix = useSelector((state) => {
      const rawColumnIds = childrenIds.map(
        (tableId) => state.columns.idsByTable[tableId]
      );
      const maxLength = Math.max(...rawColumnIds.map((row) => row.length));
      return rawColumnIds.map((row) => {
        if (row.length < maxLength) {
          return [...row, ...Array(maxLength - row.length).fill(null)];
        }
        return row;
      });
    });
    const m = Math.max(...columnIdMatrix.map((c) => c.length));
    const n = columnIdMatrix.length;

    return (
      <WrappedComponent
        {...props}
        tableIds={childrenIds}
        columnIdMatrix={columnIdMatrix}
        m={m}
        n={n}
      />
    );
  }
  EnhancedComponent.propTypes = {
    childrenIds: PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    ).isRequired,
  };
  return EnhancedComponent;
}
