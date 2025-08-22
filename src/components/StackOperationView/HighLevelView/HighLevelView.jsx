import Box from "@mui/material/Box";
import PropTypes from "prop-types";
import ColumnMetaData from "./ColumnMetaData.jsx";

export default function HighLevelView({ columnIds }) {
  return (
    <Box>
      {columnIds.map((id) => (
        <ColumnMetaData key={id} id={id} />
      ))}
    </Box>
  );
}

HighLevelView.propTypes = {
  columnIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  tableIds: PropTypes.arrayOf(PropTypes.string).isRequired,
};
