import PropTypes from "prop-types";
import CompareColumns from "./CompareColumns";
import { useSelector } from "react-redux";
import { selectTablesById } from "../../../../slices/tablesSlice";

export default function EffectsDetail({ tableId1, tableId2 }) {
  const table1KeyColumnId = useSelector(
    (state) => selectTablesById(state, tableId1)?.keyColumnId
  );
  const table2KeyColumnId = useSelector(
    (state) => selectTablesById(state, tableId2)?.keyColumnId
  );

  return (
    <CompareColumns
      columnId1={table1KeyColumnId}
      columnId2={table2KeyColumnId}
      joinType="EQUALS" // Default join type, can be changed as needed
    />
  );
}

EffectsDetail.propTypes = {
  tableId1: PropTypes.string.isRequired,
  tableId2: PropTypes.string.isRequired,
};
