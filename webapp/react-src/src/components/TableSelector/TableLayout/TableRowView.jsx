import { DragIndicator, MoreVert } from "@mui/icons-material";
import HighlightText from "../../ui/HighlightText";
import { Chip, IconButton, Typography } from "@mui/material";
import { useRef, useState } from "react";
import { Menu, MenuItem } from "@mui/material";
import {
  formatDate,
  formatNumber,
  parseOpenRefineDate,
} from "../../../lib/utilities";
import withTableData from "../../HOC/withTableData";
import { isPointInBoundingBox } from "../../../lib/utilities/dom";
import PropTypes from "prop-types";
import {
  COLUMN_TYPE_CATEGORICAL,
  COLUMN_TYPE_NUMERICAL,
  COLUMN_TYPE_DATE,
} from "../../../data/slices/columnsSlice";

function TableRowView({
  // props from withTableData
  id,
  table,
  isHovered,
  depth,
  parentOperation,
  dragRef,
  peekTable,
  hoverTable,
  unhoverTable,
  setTableSelection,
  removeTableFromSchema,
  setTableAlias,
  dropTable,

  // props from parent component
  isDisabled = false,
  isSelectedRow,
  searchString = "",
  headers,
}) {
  const { name, alias } = table;
  const isPressed = false; // Placeholder, replace with actual
  const isInSchema = parentOperation !== undefined;
  const [anchorEl, setAnchorEl] = useState(null);
  const trRef = useRef(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event) => {
    event.stopPropagation(); // Prevent row click from firing
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (event) => {
    event.stopPropagation(); // Prevent row click from firing
    const isMouseOver = isPointInBoundingBox(
      { x: event.clientX, y: event.clientY },
      trRef.current.getBoundingClientRect()
    );
    if (!isMouseOver) {
      unhoverTable();
    }
    setAnchorEl(null);
  };

  const menuItems = [
    {
      label: "Rename table",
      isDisabled: false,
      onClick: (event) => {
        const newName = prompt("Enter new table name:", alias || name);
        if (newName && newName.trim() !== "") {
          setTableAlias(newName);
        }
        handleMenuClose(event);
      },
    },
    {
      label: "Peek at table",
      isDisabled: false,
      onClick: (event) => {
        peekTable();
        handleMenuClose(event);
      },
    },
    {
      label: "Add to selection",
      isDisabled: isSelectedRow || isDisabled || isInSchema,
      onClick: (event) => {
        setTableSelection((prev) => {
          if (prev.includes(table.id)) {
            return prev.filter((tableId) => tableId !== table.id);
          } else {
            return [...prev, table.id];
          }
        });
        handleMenuClose(event);
      },
    },
    {
      label: `Remove from schema`,
      isDisabled: !isInSchema,
      onClick: (event) => {
        removeTableFromSchema();
        handleMenuClose(event);
      },
    },
    {
      label: "Delete table",
      isDisabled: false,
      onClick: (event) => {
        dropTable();
        handleMenuClose(event);
      },
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
      ref={trRef}
      className={className.join(" ")}
      data-tableid={table.id}
      onMouseEnter={hoverTable}
      onMouseLeave={unhoverTable}
      onClick={(event) => {
        setTableSelection((prev) => {
          if (event.shiftKey) {
            const tr = event.currentTarget;
            const rows = Array.from(tr.parentNode.children);
            const ids = rows.map((row) => row.getAttribute("data-tableid"));
            const clickedIndex = ids.indexOf(table.id);
            // Find indices of selected rows in DOM order
            const selectedIndices = prev
              .map((tableId) => ids.indexOf(tableId))
              .filter((i) => i !== -1);

            if (selectedIndices.length === 0) {
              // No selection yet, just select clicked
              return [table.id];
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
              return [table.id];
            }

            // Return the table IDs in the selected range
            return ids.slice(range[0], range[1] + 1);
          } else {
            // Single select
            return [table.id];
          }
        });
      }}
    >
      <td className="drag-handle" ref={dragRef}>
        <DragIndicator />
      </td>
      {headers.map(({ attr, attrType }) => (
        <td key={attr}>
          <Typography color={isDisabled ? "textDisabled" : "normal"}>
            {attrType === COLUMN_TYPE_CATEGORICAL ? (
              <HighlightText pattern={searchString} text={table[attr]} />
            ) : attrType === COLUMN_TYPE_NUMERICAL ? (
              formatNumber(table[attr])
            ) : attrType === COLUMN_TYPE_DATE ? (
              formatDate(new Date(table[attr]))
            ) : null}
          </Typography>
        </td>
      ))}
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

// TableRowView.propTypes = {
//   id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,

//   isHovered: PropTypes.bool,
//   depth: PropTypes.number,
//   parentOperation: PropTypes.shape({
//     operationType: PropTypes.string,
//   }),
//   dragRef: PropTypes.oneOfType([
//     PropTypes.func,
//     PropTypes.shape({ current: PropTypes.any }),
//   ]),
//   peekTable: PropTypes.func.isRequired,
//   hoverTable: PropTypes.func.isRequired,
//   unhoverTable: PropTypes.func.isRequired,
//   setTableSelection: PropTypes.func.isRequired,
//   removeTableFromSchema: PropTypes.func.isRequired,
//   isDisabled: PropTypes.bool,
//   isSelectedRow: PropTypes.bool,
//   searchString: PropTypes.string,
//   headers: PropTypes.arrayOf(
//     PropTypes.shape({
//       attr: PropTypes.string.isRequired,
//       attrType: PropTypes.string.isRequired,
//     })
//   ).isRequired,
// };

const EnhancedTableRowView = withTableData(TableRowView);
export default EnhancedTableRowView;
