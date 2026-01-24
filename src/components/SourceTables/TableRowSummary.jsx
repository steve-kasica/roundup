/**
 * @fileoverview TableRowSummary Component
 *
 * A comprehensive table row component for displaying table summary information in a
 * tabular format. Includes selection checkboxes, drag indicators, context menus,
 * and bar chart visualizations for table statistics.
 *
 * Features:
 * - Checkbox selection
 * - Drag-and-drop indicators
 * - Context menu for actions
 * - Text highlighting for search
 * - Bar chart cells for visual statistics
 * - Date, number, and byte formatting
 * - Integration with table and alert data
 *
 * @module components/TableView/TableRowSummary
 *
 * @example
 * <EnhancedTableRowSummary
 *   id={tableId}
 *   isSelected={true}
 *   handleClick={handleRowClick}
 *   searchString="sales"
 * />
 */

import { DragIndicator } from "@mui/icons-material";
import HighlightText from "../ui/HighlightText";
import { Typography, Checkbox, Stack, Box, TableCell } from "@mui/material";
import { useCallback, useState } from "react";
import { Menu, MenuItem } from "@mui/material";
import { formatDate, formatNumber, formatBytes } from "../../lib/utilities";
import { withTableData, withAssociatedAlerts } from "../HOC";
import StyledTableRow from "./StyledTableRow";
import BarChartCell from "./BarChartCell";
import { IntegerNumber } from "../ui/text";
import { addToSelectedTableIds } from "../../slices/uiSlice";
import { useDispatch } from "react-redux";

export const TABLE_ROW_VIEW_CLASS = "TableRowSummary";

const TableRowSummary = ({
  // Props from withAssociatedAlerts
  totalCount,

  // props from withTableData
  id,
  name,
  mimeType,
  size,
  dateLastModified,
  rowCount,
  columnCount,
  isInSchema,
  isSelected,

  setTableName,

  hoverTable,
  unhoverTable,
  dropTable,
  focusTable,
  isDisabled = false, // TODO: remove this, I don't think it's being set anywhere above

  // props passed from TableLayout.jsx
  onTrClick,
  searchString,
  rowMax,
  columnMax,
  bytesMax,
  hasNameMatch, // does the table name match the search string?

  // Props from TableDragContainer
  dragDropRef,
}) => {
  if (import.meta.env.VITE_DEBUG_RENDER === "true") {
    console.debug("Rendering TableRowSummary for table:", id);
  }

  console.log("Table ID:", id, "isSelected:", isSelected);

  return (
    <StyledTableRow
      isDragging={false} // TODO
      isDisabled={isDisabled || (searchString.length > 0 && !hasNameMatch)}
      isSelected={isSelected}
      isHovered={false} // TODO: Implement hover state if needed
      totalCount={totalCount}
      hasNameMatch={hasNameMatch}
      data-tableid={id}
      data-selected={isSelected}
      onMouseEnter={hoverTable}
      onMouseLeave={unhoverTable}
      onClick={(event) => onTrClick(event, id)}
      onDoubleClick={focusTable}
    >
      <Typography
        variant="data-primary"
        color={isDisabled ? "textDisabled" : "normal"}
        data-column="checkbox"
      >
        <Stack direction="row" alignItems="center" gap="1px">
          <Box
            ref={dragDropRef}
            sx={{
              display: "flex",
              alignItems: "center",
              cursor: "grab",
              "&:hover .drag-icon": {
                color: "#ff9800",
                transform: "scale(1.1)",
                filter: "drop-shadow(0 2px 4px rgba(255, 152, 0, 0.3))",
              },
              "&:active .drag-icon": {
                cursor: "grabbing",
                transform: "scale(0.95)",
                color: "#f57c00",
              },
            }}
          >
            <DragIndicator
              className="drag-icon"
              sx={{
                color: "text.secondary",
                opacity: 0.1,
                transition: "all 0.2s ease-in-out",
              }}
            />
          </Box>
          <Checkbox
            checked={isInSchema}
            size="small"
            disabled
            sx={{
              padding: 0,
              pointerEvents: "none",
            }}
          />
        </Stack>
      </Typography>
      <TableCell sx={{ padding: 0 }}>
        <Typography
          variant="data-primary"
          color={
            isDisabled ? "textDisabled" : totalCount ? "warning.dark" : "normal"
          }
          data-column="name"
        >
          <HighlightText
            pattern={searchString}
            text={name}
            matchSx={{
              backgroundColor: "yellow",
            }}
          />
        </Typography>
      </TableCell>
      <TableCell sx={{ padding: 0 }}>
        <Typography
          variant="data-primary"
          color={isDisabled ? "textDisabled" : "normal"}
          data-column="mimeType"
        >
          {mimeType || "N/A"}
        </Typography>
      </TableCell>
      <TableCell sx={{ padding: 0 }}>
        <BarChartCell
          variant="data-primary"
          color={isDisabled ? "textDisabled" : "normal"}
          percentage={(size / bytesMax) * 100}
          isDisabled={isDisabled}
          data-column="size"
        >
          {formatBytes(size)}
        </BarChartCell>
      </TableCell>
      <TableCell sx={{ padding: 0 }}>
        <BarChartCell
          variant="data-primary"
          color={isDisabled ? "textDisabled" : "normal"}
          percentage={(rowCount / rowMax) * 100}
          isDisabled={isDisabled}
          data-column="rowCount"
        >
          <IntegerNumber value={rowCount} />
        </BarChartCell>
      </TableCell>
      <TableCell sx={{ padding: 0 }}>
        <BarChartCell
          variant="data-primary"
          color={isDisabled ? "textDisabled" : "normal"}
          percentage={(columnCount / columnMax) * 100}
          isDisabled={isDisabled}
          data-column="columnCount"
        >
          <IntegerNumber value={columnCount} />
        </BarChartCell>
      </TableCell>
      <TableCell sx={{ padding: 0 }}>
        <Typography
          variant="data-primary"
          color={isDisabled ? "textDisabled" : "normal"}
          data-column="dateLastModified"
        >
          {formatDate(new Date(dateLastModified))}
        </Typography>
      </TableCell>
    </StyledTableRow>
  );
};

const EnhancedTableRowSummary = withAssociatedAlerts(
  withTableData(TableRowSummary),
);
export { EnhancedTableRowSummary, TableRowSummary };
