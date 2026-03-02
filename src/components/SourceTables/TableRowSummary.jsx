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

import HighlightText from "../ui/HighlightText";
import { Typography, Checkbox, Box, TableRow, TableCell } from "@mui/material";
import { useMemo, useState } from "react";
import { formatDate, formatBytes } from "../../lib/utilities";
import { withTableData, withAssociatedAlerts } from "../HOC";
import BarChartCell from "./BarChartCell";
import { IntegerNumber } from "../ui/text";
import {
  selectTableSearchString,
  selectFocusedObjectId,
} from "../../slices/uiSlice";
import { useSelector } from "react-redux";
// import TableCell from "./TableCell";
import { RemoveRedEye } from "@mui/icons-material";

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
  focusTable,
  isDisabled = false, // TODO: remove this, I don't think it's being set anywhere above

  // props passed from SourceTables.jsx
  onTrClick,
  rowMax,
  columnMax,
  bytesMax,
  isPrevSelected,
  isNextSelected,

  // Props from TableDragContainer
  dragDropRef,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const clickTimeout = useState(null);

  const searchString = useSelector(selectTableSearchString);
  const focusedObjectId = useSelector(selectFocusedObjectId);
  const isFocused = focusedObjectId === id;

  const hasNameMatch = useMemo(() => {
    if (!searchString) return true;
    return name.toLowerCase().includes(searchString.toLowerCase());
  }, [name, searchString]);

  const handleMouseEnter = (event) => {
    setIsHovered(true);
    // hoverTable(event);
  };

  const handleMouseLeave = (event) => {
    setIsHovered(false);
    // unhoverTable(event);
  };

  const handleClick = (event) => {
    if (clickTimeout[0]) {
      clearTimeout(clickTimeout[0]);
      clickTimeout[1](null);
    }
    clickTimeout[1](
      setTimeout(() => {
        onTrClick(event, id);
        clickTimeout[1](null);
      }, 100),
    );
  };

  const handleDoubleClick = (e) => {
    if (clickTimeout[0]) {
      clearTimeout(clickTimeout[0]);
      clickTimeout[1](null);
    }
    e.stopPropagation();
    focusTable();
  };

  return (
    <TableRow
      hover={!isDisabled || searchString.length === 0 || hasNameMatch}
      selected={isSelected}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-tableid={id}
      data-selected={isSelected}
      ref={dragDropRef}
      sx={{
        userSelect: "none",
        height: "1px", // allows the row to shrink to fit content, but not grow larger than its content
        opacity:
          isDisabled || (searchString.length > 0 && !hasNameMatch) ? 0.5 : 1,
        cursor:
          isDisabled || (searchString.length > 0 && !hasNameMatch)
            ? "not-allowed"
            : "pointer",
      }}
    >
      <TableCell
        sx={{
          border: "2px solid transparent",
          backgroundColor: (theme) => theme.palette.background.paper,
          padding: 0.25,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            cursor: "grab",
            gap: 0.5,
            height: "20px",
          }}
        >
          <Checkbox
            checked={isInSchema}
            size="small"
            disabled
            aria-label={`Select table ${name}`}
            sx={{
              padding: 0.25,
              pointerEvents: "none",
            }}
          />
          {isFocused && (
            <RemoveRedEye
              sx={{
                color: (theme) => theme.palette.action.active,
              }}
            ></RemoveRedEye>
          )}
        </Box>
      </TableCell>
      <TableCell
        isSelected={isSelected}
        isPrevSelected={isPrevSelected}
        isNextSelected={isNextSelected}
        padding={"none"}
        sx={{ maxWidth: 0, paddingRight: 0.5 }}
      >
        <Typography
          variant="data-primary"
          color={
            isDisabled ? "textDisabled" : totalCount ? "warning.dark" : "normal"
          }
          data-column="name"
          noWrap
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
      <TableCell
        isSelected={isSelected}
        isPrevSelected={isPrevSelected}
        isNextSelected={isNextSelected}
        padding={"none"}
        // sx={{ padding: 0.25 }}
      >
        <Typography
          variant="data-primary"
          color={isDisabled ? "textDisabled" : "normal"}
          data-column="mimeType"
        >
          {mimeType || "N/A"}
        </Typography>
      </TableCell>
      <TableCell
        isSelected={isSelected}
        isPrevSelected={isPrevSelected}
        isNextSelected={isNextSelected}
        padding={"none"}
      >
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
      <TableCell
        isSelected={isSelected}
        isPrevSelected={isPrevSelected}
        isNextSelected={isNextSelected}
        padding={"none"}
      >
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
      <TableCell
        isSelected={isSelected}
        isPrevSelected={isPrevSelected}
        isNextSelected={isNextSelected}
        padding={"none"}
      >
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
      <TableCell
        isSelected={isSelected}
        isPrevSelected={isPrevSelected}
        isNextSelected={isNextSelected}
        padding={"none"}
      >
        <Typography
          variant="data-primary"
          color={isDisabled ? "textDisabled" : "normal"}
          data-column="dateLastModified"
        >
          {formatDate(new Date(dateLastModified))}
        </Typography>
      </TableCell>
    </TableRow>
  );
};

const EnhancedTableRowSummary = withAssociatedAlerts(
  withTableData(TableRowSummary),
);
export { EnhancedTableRowSummary, TableRowSummary };
