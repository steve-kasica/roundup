/**
 * Example of using the withPaginatedRows HOC with TableView
 */
import PropTypes from "prop-types";
import withTableData from "../HOC/withTableData";
import LowLevelView from "./LowLevelView";
import HighLevelView from "./HighLevelView";

const TableView = ({ table, operation, activeColumnIds, resolution }) => {
  return resolution === "low" ? (
    <LowLevelView
      id={table.id}
      columnIds={activeColumnIds}
      table={table}
      operation={operation}
    />
  ) : (
    <HighLevelView
      id={table.id}
      columnIds={activeColumnIds}
      table={table}
      operation={operation}
    />
  );
};

TableView.propTypes = {
  table: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  }).isRequired,
  operation: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    rowCount: PropTypes.number,
    name: PropTypes.string,
  }),
  activeColumnIds: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  ).isRequired,
  resolution: PropTypes.oneOf(["low", "high"]).isRequired,
};
const EnhancedTableView = withTableData(TableView);

EnhancedTableView.displayName = "EnhancedTableView";

export default EnhancedTableView;
