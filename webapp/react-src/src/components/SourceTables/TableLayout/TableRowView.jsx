import { DragIndicator, MoreVert } from "@mui/icons-material";
import HighlightText from "../../ui/HighlightText";
import { Chip, IconButton, Typography } from "@mui/material";
import { useState } from "react";
import { Menu, MenuItem } from "@mui/material";
import { useDispatch } from "react-redux";
import {
  formatDate,
  formatNumber,
  parseOpenRefineDate,
} from "../../../lib/utilities";
import { peekTableAction } from "../../../data/sagas/peekTableSaga";

// export default function TableRowView({searchString, table}) {
export default function TableRowView({ table, searchString = "" }) {
  const {
    id,
    parentId,
    name,
    rowCount,
    columnCount,
    dateCreated,
    dateLastModified,
    tags,
  } = table;
  // const isDisabled = [table.name].join("^").indexOf(searchString) < 0;
  const isDisabled = false; // Placeholder for actual disabled logic
  const dispatch = useDispatch();

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <td className="drag-handle">
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
              dispatch(peekTableAction({ tableId: id, columnCount }));
              handleMenuClose();
            }}
          >
            Peek
          </MenuItem>
        </Menu>
      </td>
    </>
  );
}
