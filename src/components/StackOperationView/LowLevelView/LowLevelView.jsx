import { useState } from "react";
import ColumnView from "./ColumnView";
import PropTypes from "prop-types";
import { forwardRef } from "react";
import { Box } from "@mui/material";

// Really, all this component does is sync scroll between column views
const LowLevelView = forwardRef(
  (
    {
      columnIds,
      onCellClick,
      dragMode,
      setDragMode,
      valueCount = 10,
      tableIds,
    },
    ref
  ) => {
    const [scrollTop, setScrollTop] = useState(0);

    // Handler to sync scroll position
    const handleScroll = (newScrollTop) => {
      setScrollTop(newScrollTop);
    };

    return (
      <Box ref={ref}>
        {columnIds.map((id) => (
          <ColumnView
            key={id}
            id={id}
            limit={valueCount}
            onCellClick={onCellClick}
            scrollTop={scrollTop}
            onScroll={handleScroll}
            dragMode={dragMode}
            setDragMode={setDragMode}
          />
        ))}
      </Box>
    );
  }
);

LowLevelView.displayName = "LowLevelView";

LowLevelView.propTypes = {
  columnIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  onCellClick: PropTypes.func.isRequired,
  dragMode: PropTypes.string.isRequired,
  setDragMode: PropTypes.func.isRequired,
  valueCount: PropTypes.number,
  tableIds: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default LowLevelView;
