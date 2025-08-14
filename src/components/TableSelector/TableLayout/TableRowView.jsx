import { MoreVert } from "@mui/icons-material";
import HighlightText from "../../ui/HighlightText";
import StyledDraggableRow from "../../ui/StyledDraggableRow";
import { IconButton, Typography } from "@mui/material";
import { useRef, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Menu, MenuItem } from "@mui/material";
import { formatDate, formatNumber, formatBytes } from "../../../lib/utilities";
import withTableData from "../../HOC/withTableData";
import { isPointInBoundingBox } from "../../../lib/utilities/dom";
import { useDrag } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";
import PropTypes from "prop-types";
import "./MultiSelectDrag.css";

export const TABLE_ROW_VIEW_CLASS = "TableRowView";

function TableRowView({
  // props from withTableData
  table,
  removedColumnIds,
  isHovered,
  depth,
  parentOperation,
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
  addSelectedTablesToSchema,
  addTableToSchema,

  // props from parent component
  isDisabled = false,
  searchString,
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const trRef = useRef(null);
  const open = Boolean(anchorEl);

  // Get selection state for multi-row dragging
  const selectedTableIds = useSelector((state) => state.tables.selected || []);
  const selectedTables = useSelector((state) =>
    selectedTableIds.map((id) => state.tables.data[id]).filter(Boolean)
  );

  // Set up drag functionality for table rows
  const [{ isDragging }, dragRef, dragPreview] = useDrag({
    type: TABLE_ROW_VIEW_CLASS,
    item: () => {
      // If this table is selected and there are multiple selected tables,
      // drag all selected tables as a group
      const isCurrentTableSelected = selectedTableIds.includes(table.id);

      if (isCurrentTableSelected && selectedTableIds.length > 1) {
        const item = {
          id: selectedTableIds, // Array of IDs for multi-select
          tables: selectedTables, // Array of table objects
          count: selectedTables.length,
          type: "multiple-tables",
          primaryTable: table, // The table being dragged
        };
        return item;
      } else {
        // Single table drag
        const item = {
          id: table.id,
          name: table.name,
          type: "table",
          tables: [table], // Consistent array format
          count: 1,
        };
        return item;
      }
    },
    canDrag: () => !isDisabled,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult();
      if (dropResult.accepted && item.type === "multiple-tables") {
        addSelectedTablesToSchema(dropResult.operationType);
      } else if (dropResult.accepted && item.type === "table") {
        addTableToSchema(dropResult.operationType);
      }
    },
  });

  // Remove default drag preview
  useEffect(() => {
    dragPreview(getEmptyImage(), { captureDraggingState: true });
  }, [dragPreview]);

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
    parentOperation ? parentOperation.operationType : "",
    depth !== undefined ? `depth-${depth}` : "",
    selectedTableIds.includes(table.id) && selectedTableIds.length > 1
      ? "multi-selected"
      : "",
  ].filter(Boolean);

  // Combine the drag ref from withTableData with our table drag ref
  // const setCombinedRef = (node) => {
  //   if (dragRef) {
  //     if (typeof dragRef === "function") {
  //       dragRef(node);
  //     } else {
  //       dragRef.current = node;
  //     }
  //   }
  //   dragRef(node);
  //   trRef.current = node;
  // };

  return (
    <StyledDraggableRow
      ref={dragRef}
      className={className.join(" ")}
      isDragging={isDragging}
      isDisabled={isDisabled}
      isSelected={isSelected}
      isHovered={isHovered}
      data-tableid={table.id}
      data-multiselected={
        selectedTableIds.includes(table.id) && selectedTableIds.length > 1
      }
      data-selection-count={selectedTableIds.length}
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
      <Typography component="td" color={isDisabled ? "textDisabled" : "normal"}>
        <HighlightText pattern={searchString} text={table.name} />
        {selectedTableIds.includes(table.id) && selectedTableIds.length > 1 && (
          <span
            style={{
              marginLeft: "8px",
              padding: "2px 6px",
              backgroundColor: isDragging ? "#ff9800" : "#1976d2",
              color: "white",
              fontSize: "0.75rem",
              borderRadius: "12px",
              fontWeight: "bold",
            }}
          >
            +{selectedTableIds.length - 1}
          </span>
        )}
      </Typography>
      <Typography component="td" color={isDisabled ? "textDisabled" : "normal"}>
        {formatBytes(table.size)}
      </Typography>
      <Typography component="td" color={isDisabled ? "textDisabled" : "normal"}>
        {table.mimeType || "N/A"}
      </Typography>
      <Typography component="td" color={isDisabled ? "textDisabled" : "normal"}>
        {formatNumber(table.rowCount)}
      </Typography>
      <Typography component="td" color={isDisabled ? "textDisabled" : "normal"}>
        {`${formatNumber(table.columnIds.length)}`}
        <sup
          style={{ display: removedColumnIds.length > 0 ? "inline" : "none" }}
        >
          *
        </sup>
      </Typography>
      <Typography component="td" color={isDisabled ? "textDisabled" : "normal"}>
        {formatDate(new Date(table.dateLastModified))}
      </Typography>
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
    </StyledDraggableRow>
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
  removedColumnIds: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  ).isRequired,
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
};

const EnhancedTableRowView = withTableData(TableRowView);
export default EnhancedTableRowView;
