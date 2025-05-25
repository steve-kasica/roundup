import { DragIndicator, MoreVert } from "@mui/icons-material";
import HighlightText from "../../ui/HighlightText";
import { Chip, IconButton, Typography } from "@mui/material";
import { useState } from "react";
import { Menu, MenuItem } from "@mui/material";
import {
  formatDate,
  formatNumber,
  parseOpenRefineDate,
} from "../../../lib/utilities";
import withTableData from "../../HOC/withTableData";

function TableRowView({
  // props from withTableData
  id,
  name,
  rowCount,
  columnIds,
  dateCreated,
  dateLastModified,
  tags,
  isHovered,
  depth,
  parentOperation,
  dragRef,
  peekTable,
  hoverTable,
  unhoverTable,
  selectTable,
  unselectTable,
  setTableSelection,
  removeTableFromSchema,

  // props from parent component
  isDisabled = false,
  isSelectedRow,
  searchString = "",
  updateTableSelection,
}) {
  const columnCount = columnIds.length;
  const isInSchema = parentOperation !== null;
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const menuItems = [
    {
      label: "Peek",
      isDisabled: false,
      onClick: () => {
        peekTable();
        handleMenuClose();
      },
    },
    {
      label: `Remove`,
      isDisabled: !isInSchema,
      onClick: removeTableFromSchema,
    },
  ];

  const className = [
    "TableRowView",
    isSelectedRow ? "selected" : "",
    isDisabled ? "disabled" : "",
    isHovered ? "hovered" : "",
    parentOperation ? parentOperation.operationType : "",
    depth ? `depth-${depth}` : "",
  ].filter(Boolean);

  return (
    <tr
      className={className.join(" ")}
      data-tableid={id}
      onMouseEnter={hoverTable}
      onMouseLeave={unhoverTable}
      onClick={(event) => {
        setTableSelection((prev) => {
          if (event.shiftKey) {
            const tr = event.currentTarget;
            const rows = Array.from(tr.parentNode.children);
            const ids = rows.map((row) => row.getAttribute("data-tableid"));
            const clickedIndex = ids.indexOf(id);
            // Find indices of selected rows in DOM order
            const selectedIndices = prev
              .map((tableId) => ids.indexOf(tableId))
              .filter((i) => i !== -1);

            if (selectedIndices.length === 0) {
              // No selection yet, just select clicked
              return [id];
            }

            const min = Math.min(...selectedIndices);
            const max = Math.max(...selectedIndices);

            let range;
            if (clickedIndex < min) {
              range = [clickedIndex, min];
            } else if (clickedIndex > max) {
              range = [max, clickedIndex];
            } else {
              // Clicked inside the range, select only that row
              return [id];
            }

            // Return the table IDs in the selected range
            return ids.slice(range[0], range[1] + 1);
          } else {
            // Single select
            return [id];
          }
        });
      }}
    >
      <td className="drag-handle" ref={dragRef}>
        <DragIndicator />
      </td>
      <td>
        <Typography color={isDisabled ? "textDisabled" : "normal"}>
          <HighlightText pattern={searchString} text={name} />
        </Typography>
      </td>
      <td>
        {tags.map((tag) => (
          <Chip key={tag} label={tag} size="small" />
        ))}
      </td>
      <td>
        <Typography color={isDisabled ? "textDisabled" : "normal"}>
          {formatNumber(rowCount)}
        </Typography>
      </td>
      <td>
        <Typography color={isDisabled ? "textDisabled" : "normal"}>
          {formatNumber(columnCount)}
        </Typography>
      </td>
      <td>
        <Typography color={isDisabled ? "textDisabled" : "normal"}>
          {formatDate(parseOpenRefineDate(dateCreated))}
        </Typography>
      </td>
      <td>
        <Typography color={isDisabled ? "textDisabled" : "normal"}>
          {formatDate(parseOpenRefineDate(dateLastModified))}
        </Typography>
      </td>
      <td className="more-options">
        <IconButton onClick={handleMenuOpen}>
          <MoreVert />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          {menuItems.map((item) => (
            <MenuItem
              key={item.label}
              disabled={item.isDisabled}
              onClick={item.onClick}
            >
              {item.label}
            </MenuItem>
          ))}
        </Menu>
      </td>
    </tr>
  );
}

const EnhancedTableRowView = withTableData(TableRowView);
export default EnhancedTableRowView;
