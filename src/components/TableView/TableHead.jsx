/* eslint-disable react/prop-types */
import { useEffect, useRef } from "react";
import { Box } from "@mui/material";
import ColumnHeader from "../ColumnViews/ColumnHeader";
import { COLUMN_WIDTHS } from "./index.js";
import TableRow from "./TableRow.jsx";
import TableCell from "./TableCell.jsx";

const TableHead = ({
  activeColumnIds,
  selectedColumnIds,
  handleColumnClick,
  onScroll,
  onScrollContainerRef,
}) => {
  const scrollContainerRef = useRef(null);
  // Register the scroll container with parent when it changes
  useEffect(() => {
    if (onScrollContainerRef && scrollContainerRef.current) {
      onScrollContainerRef(scrollContainerRef.current);
    }
  }, [onScrollContainerRef]);
  return (
    <TableRow
      ref={scrollContainerRef}
      onScroll={onScroll}
      sx={{
        overflowX: "auto",
        overflowY: "hidden",
        width: "100%",
        flexShrink: 0,
        // Hide scrollbar for webkit browsers (Chrome, Safari)
        "&::-webkit-scrollbar": {
          display: "none",
        },
        // Hide scrollbar for Firefox
        scrollbarWidth: "none",
        // For IE and Edge
        msOverflowStyle: "none",
      }}
    >
      {/* Data column headers */}
      {activeColumnIds.map((columnId) => (
        <TableCell
          key={columnId}
          isSelected={selectedColumnIds.includes(columnId)}
          sx={{
            cursor: "pointer",
            flexShrink: 0,
            minWidth: COLUMN_WIDTHS.default || "150px",
          }}
          onClick={(event) => handleColumnClick?.(event, columnId)}
        >
          <ColumnHeader id={columnId} />
        </TableCell>
      ))}
    </TableRow>
  );
};

TableHead.displayName = "TableHead";

export default TableHead;
