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
  name,
  rowCount,
  columnCount,
  dateCreated,
  dateLastModified,
  tags,
  dragRef,
  peekTable,
  hoverTable,
  unhoverTable,

  // props from parent component
  isDisabled = false,
  searchString = "",
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <tr
      className="TableRowView"
      onMouseEnter={hoverTable}
      onMouseLeave={unhoverTable}
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
          <MenuItem
            onClick={() => {
              peekTable();
              handleMenuClose();
            }}
          >
            Peek
          </MenuItem>
        </Menu>
      </td>
    </tr>
  );
}

const EnhancedTableRowView = withTableData(TableRowView);
export default EnhancedTableRowView;
