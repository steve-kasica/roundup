import { DragIndicator, MoreVert } from "@mui/icons-material";
import HighlightText from "../../ui/HighlightText";
import { IconButton, Typography } from "@mui/material";
import { useRef, useState } from "react";
import { Menu, MenuItem } from "@mui/material";
import { formatDate, formatNumber, formatBytes } from "../../../lib/utilities";
import withTableData from "../../HOC/withTableData";
import { isPointInBoundingBox } from "../../../lib/utilities/dom";
import PropTypes from "prop-types";
import {
  COLUMN_TYPE_CATEGORICAL,
  COLUMN_TYPE_NUMERICAL,
  COLUMN_TYPE_DATE,
} from "../../../slices/columnsSlice";

function TableRowView({
  // props from withTableData
  table,
  isHovered,
  depth,
  parentOperation,
  dragRef,
  // functions to dispatch actions
  peekTable,
  hoverTable,
  unhoverTable,
  setTableSelection,
  removeTableFromSchema,
  renameTable,
  dropTable,
  isInSchema,
  isSelected,

  // props from parent component
  isDisabled = false,
  searchString,
  headers,
}) {
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
        const newName = prompt("Enter new table name:", table.name);
        if (newName && newName.trim() !== "") {
          renameTable(newName);
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
      isDisabled: isSelected || isDisabled || isInSchema,
      onClick: (event) => {
        setTableSelection();
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
    isSelected ? "selected" : "",
    isDisabled ? "disabled" : "",
    isHovered ? "hovered" : "",
    parentOperation ? parentOperation.operationType : "",
    depth !== undefined ? `depth-${depth}` : "",
  ].filter(Boolean);

  return (
    <tr
      ref={trRef}
      className={className.join(" ")}
      data-tableid={table.id}
      onMouseEnter={hoverTable}
      onMouseLeave={unhoverTable}
      onClick={(event) => {
        event.stopPropagation();

        if (event.shiftKey) {
          const tr = event.currentTarget;
          const rows = Array.from(tr.parentNode.children);
          const ids = rows.map((row) => row.getAttribute("data-tableid"));
          const clickedIndex = ids.indexOf(table.id);
          // Find all selected rows in DOM order
          const selectedRows = rows.filter((row) =>
            row.classList.contains("selected")
          );
          const selectedIndices = selectedRows.map((row) =>
            ids.indexOf(row.getAttribute("data-tableid"))
          );

          let anchorIndex;
          if (selectedIndices.length > 0) {
            // Use the last selected row as the anchor
            anchorIndex = selectedIndices[selectedIndices.length - 1];
          } else {
            anchorIndex = clickedIndex;
          }

          const [start, end] = [
            Math.min(anchorIndex, clickedIndex),
            Math.max(anchorIndex, clickedIndex),
          ];

          const rangeIds = ids.slice(start, end + 1);
          setTableSelection(rangeIds);
        } else {
          setTableSelection(table.id);
        }
      }}
    >
      <td className="drag-handle" ref={dragRef}>
        <DragIndicator />
      </td>
      {headers.map(({ attr, attrType }) => (
        <td key={attr}>
          <Typography color={isDisabled ? "textDisabled" : "normal"}>
            {attr === "size" ? (
              formatBytes(table[attr])
            ) : attrType === COLUMN_TYPE_CATEGORICAL ? (
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

TableRowView.propTypes = {
  table: PropTypes.object.isRequired,
  isHovered: PropTypes.bool,
  depth: PropTypes.number,
  parentOperation: PropTypes.oneOfType([
    PropTypes.shape({ operationType: PropTypes.string }),
    PropTypes.oneOf([null]),
  ]),
  dragRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.any }),
  ]),
  peekTable: PropTypes.func.isRequired,
  hoverTable: PropTypes.func.isRequired,
  unhoverTable: PropTypes.func.isRequired,
  setTableSelection: PropTypes.func.isRequired,
  removeTableFromSchema: PropTypes.func.isRequired,
  renameTable: PropTypes.func.isRequired,
  dropTable: PropTypes.func.isRequired,
  isInSchema: PropTypes.bool,
  isSelected: PropTypes.bool,
  isDisabled: PropTypes.bool,
  searchString: PropTypes.string,
  headers: PropTypes.arrayOf(
    PropTypes.shape({
      attr: PropTypes.string.isRequired,
      attrType: PropTypes.string.isRequired,
    })
  ).isRequired,
};

const EnhancedTableRowView = withTableData(TableRowView);
export default EnhancedTableRowView;
