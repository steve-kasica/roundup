import Box from "@mui/material/Box";
import PropTypes from "prop-types";
import ColumnMetaData from "./ColumnMetaData.jsx";
import { forwardRef } from "react";

const HighLevelView = forwardRef(
  ({ columnIds, dragMode, onCellClick, setDragMode }, ref) => (
    <Box ref={ref}>
      {columnIds.map((id) => (
        <ColumnMetaData
          key={id}
          id={id}
          onCellClick={onCellClick}
          dragMode={dragMode}
          setDragMode={setDragMode}
        />
      ))}
    </Box>
  )
);

HighLevelView.displayName = "HighLevelView";

HighLevelView.propTypes = {
  columnIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  tableIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  dragMode: PropTypes.string.isRequired,
  setDragMode: PropTypes.func.isRequired,
  onCellClick: PropTypes.func.isRequired,
};

export default HighLevelView;
