import { useDispatch, useSelector } from "react-redux";
import PropTypes from "prop-types";
import {
  selectOperation,
  setOperationColumnName,
} from "../../../slices/operationsSlice";

// TODO: how to handlethe case when tableIds are actually
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
  function EnhancedComponent({ operation, ...props }) {
    const dispatch = useDispatch();

    const columnIdMatrix = useSelector((state) => {
      // TODO: what if the childId is not a table?
      const rawColumnIds = operation.children.map(
        (childId) => state.columns.idsByTable[childId] || []
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
    const columnNames = operation.columnNames || Array(m).fill("");

    return (
      <WrappedComponent
        {...props}
        tableIds={operation.children} // TODO: what if these are not all tables?
        columnIdMatrix={columnIdMatrix}
        m={m}
        n={n}
        columnNames={columnNames}
        renameOperationColumn={(index, newName) =>
          dispatch(
            setOperationColumnName({
              operationId: operation.id,
              index,
              newName,
            })
          )
        }
      />
    );
  }
  EnhancedComponent.propTypes = {
    operation: PropTypes.object.isRequired,
  };
  return EnhancedComponent;
}
