import withTableData from "../../HOC/withTableData";
import PropTypes from "prop-types";
import { Box } from "@mui/material";

function TableView({ table, hoverTable, unhoverTable }) {
  return (
    <Box
      className="cell"
      onMouseEnter={hoverTable}
      onMouseLeave={unhoverTable}
      sx={{
        height: "auto", // Match Cell height behavior
        minHeight: "39px", // Ensure minimum height for alignment
        display: "flex",
        alignItems: "center",
        textAlign: "right",
        justifyContent: "flex-end",
        padding: "2.5px 8px", // Match Cell inner box padding
        margin: "5px 0px", // Match Cell component margin
        fontSize: "0.875rem",
      }}
    >
      {table.name}
    </Box>
  );
}

TableView.propTypes = {
  table: PropTypes.object.isRequired,
  hoverTable: PropTypes.func.isRequired,
  unhoverTable: PropTypes.func.isRequired,
};

const EnhancedTableView = withTableData(TableView);

export default EnhancedTableView;
