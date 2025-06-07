import { useSelector } from "react-redux";
import PropTypes from "prop-types";
import {
  selectColumnIdsByTableId,
  selectColumnById,
} from "../../data/slices/columnsSlice";

export default function withColumnMatrixData(WrappedComponent) {
  return function WithColumnMatrixData({ tableId, ...props }) {
    const columns = useSelector((state) =>
      selectColumnIdsByTableId(state, tableId).map((id) =>
        selectColumnById(state, id)
      )
    );

    // Build columnLabels and columnMatrix
    const columnLabels = columns.map((col) => col.label || col.name);

    // For each column, collect its values from all rows
    const columnMatrix = columns.map((col) => rows.map((row) => row[col.name]));

    return (
      <WrappedComponent
        {...props}
        columnMatrix={columnMatrix}
        columnLabels={columnLabels}
      />
    );
  };
}

withColumnMatrixData.propTypes = {
  WrappedComponent: PropTypes.elementType,
};

withColumnMatrixData.WithColumnMatrixDataPropTypes = {
  tableId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};
