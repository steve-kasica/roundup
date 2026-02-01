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
import { Typography, Checkbox, Stack, Box } from "@mui/material";
import { useCallback, useMemo, useState } from "react";
import { formatDate, formatBytes } from "../../lib/utilities";
import { withTableData, withAssociatedAlerts } from "../HOC";
import StyledTableRow from "./StyledTableRow";
import BarChartCell from "./BarChartCell";
import { IntegerNumber } from "../ui/text";
import { selectTableSearchString } from "../../slices/uiSlice";
import { useSelector } from "react-redux";
import StyledTableCell from "./StyledTableCell";

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
    <StyledTableRow
      isDragging={false} // TODO
      isDisabled={isDisabled || (searchString.length > 0 && !hasNameMatch)}
      isSelected={isSelected}
      isHovered={isHovered}
      data-tableid={id}
      data-selected={isSelected}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      ref={dragDropRef}
    >
      <StyledTableCell
        sx={{
          border: "2px solid transparent",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "grab",
          }}
        >
          <Checkbox
            checked={isInSchema}
            indeterminate={isSelected}
            size="small"
            disabled
            sx={{
              padding: 0,
              pointerEvents: "none",
            }}
          />
        </Box>
      </StyledTableCell>
      <StyledTableCell
        isSelected={isSelected}
        isPrevSelected={isPrevSelected}
        isNextSelected={isNextSelected}
        sx={{
          ...(isSelected && {
            borderLeftColor: (theme) => theme.palette.grey[900],
            ...(!isPrevSelected && {
              borderTopColor: (theme) => theme.palette.grey[900],
            }),
            ...(!isNextSelected && {
              borderBottomColor: (theme) => theme.palette.grey[900],
            }),
          }),
        }}
      >
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
      </StyledTableCell>
      <StyledTableCell
        isSelected={isSelected}
        isPrevSelected={isPrevSelected}
        isNextSelected={isNextSelected}
        sx={{
          ...(isSelected && {
            ...(!isPrevSelected && {
              borderTopColor: (theme) => theme.palette.grey[900],
            }),
            ...(!isNextSelected && {
              borderBottomColor: (theme) => theme.palette.grey[900],
            }),
          }),
        }}
      >
        <Typography
          variant="data-primary"
          color={isDisabled ? "textDisabled" : "normal"}
          data-column="mimeType"
        >
          {mimeType || "N/A"}
        </Typography>
      </StyledTableCell>
      <StyledTableCell
        isSelected={isSelected}
        isPrevSelected={isPrevSelected}
        isNextSelected={isNextSelected}
        sx={{
          ...(isSelected && {
            ...(!isPrevSelected && {
              borderTopColor: (theme) => theme.palette.grey[900],
            }),
            ...(!isNextSelected && {
              borderBottomColor: (theme) => theme.palette.grey[900],
            }),
          }),
        }}
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
      </StyledTableCell>
      <StyledTableCell
        isSelected={isSelected}
        isPrevSelected={isPrevSelected}
        isNextSelected={isNextSelected}
        sx={{
          ...(isSelected && {
            ...(!isPrevSelected && {
              borderTopColor: (theme) => theme.palette.grey[900],
            }),
            ...(!isNextSelected && {
              borderBottomColor: (theme) => theme.palette.grey[900],
            }),
          }),
        }}
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
      </StyledTableCell>
      <StyledTableCell
        isSelected={isSelected}
        isPrevSelected={isPrevSelected}
        isNextSelected={isNextSelected}
        sx={{
          ...(isSelected && {
            ...(!isPrevSelected && {
              borderTopColor: (theme) => theme.palette.grey[900],
            }),
            ...(!isNextSelected && {
              borderBottomColor: (theme) => theme.palette.grey[900],
            }),
          }),
        }}
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
      </StyledTableCell>
      <StyledTableCell
        isSelected={isSelected}
        isPrevSelected={isPrevSelected}
        isNextSelected={isNextSelected}
        sx={{
          ...(isSelected && {
            borderRightColor: (theme) => theme.palette.grey[900],
            ...(!isPrevSelected && {
              borderTopColor: (theme) => theme.palette.grey[900],
            }),
            ...(!isNextSelected && {
              borderBottomColor: (theme) => theme.palette.grey[900],
            }),
          }),
        }}
      >
        <Typography
          variant="data-primary"
          color={isDisabled ? "textDisabled" : "normal"}
          data-column="dateLastModified"
        >
          {formatDate(new Date(dateLastModified))}
        </Typography>
      </StyledTableCell>
    </StyledTableRow>
  );
};

const EnhancedTableRowSummary = withAssociatedAlerts(
  withTableData(TableRowSummary),
);
export { EnhancedTableRowSummary, TableRowSummary };
