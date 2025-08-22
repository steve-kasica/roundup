// import { useState } from "react";
// import { Box, Typography, Slider } from "@mui/material";
// import withStackOperationData from "../withStackOperationData";
// import ColumnHeader from "./ColumnHeader";
// import TableView from "./TableView";
import { useState } from "react";
import ColumnValues from "./ColumnValues";
import Box from "@mui/material/Box";

const DEFAULT_VALUE_COUNT = 10;

import PropTypes from "prop-types";

export default function LowLevelView({ columnIds, tableIds }) {
  const [valueCount, setValueCount] = useState(DEFAULT_VALUE_COUNT);
  const [scrollTop, setScrollTop] = useState(0);

  // Handler to sync scroll position
  const handleScroll = (newScrollTop) => {
    setScrollTop(newScrollTop);
  };
  return (
    <Box>
      {columnIds.map((id, i) => (
        <ColumnValues
          key={id}
          columnId={id}
          tableId={tableIds[i]}
          limit={valueCount}
          scrollTop={scrollTop}
          onScroll={handleScroll}
        />
      ))}
    </Box>
  );
}

LowLevelView.propTypes = {
  columnIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  tableIds: PropTypes.arrayOf(PropTypes.string).isRequired,
};
