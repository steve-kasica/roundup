import { useDispatch } from "react-redux";
import {
  focusColumn,
  setHoverColumnIndex,
  unsetHoverColumnIndex,
} from "../../../data/uiSlice";
import { useSelector } from "react-redux";
import { getColumnIdsByIndex } from "../../../data/selectors";
import { ColumnContainer } from "../../Containers";
import ColumnBlockView from "./ColumnBlockView";
import { List, ListItemButton, Popover } from "@mui/material";
import { useRef, useState } from "react";
import { removeMultipleColumns } from "../../../data/actions";

export default function ColumnIndex({ jIndex }) {
  const dispatch = useDispatch();
  const [anchorEl, setAnchorEl] = useState(null);
  const isPopoverOpen = Boolean(anchorEl);

  const columnIds = useSelector((state) => getColumnIdsByIndex(state, jIndex));

  const index1 = jIndex + 1;

  return (
    <form key={`index-${jIndex}`}>
      <div
        className="index-label"
        onMouseEnter={() => dispatch(setHoverColumnIndex(jIndex))}
        onMouseLeave={() => dispatch(unsetHoverColumnIndex(jIndex))}
        onClick={(event) => setAnchorEl(anchorEl ? null : event.currentTarget)}
      >
        <label>{index1}</label>
        <Popover
          open={isPopoverOpen}
          anchorEl={anchorEl}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
        >
          <List>
            <ListItemButton
              onClick={() => {
                setAnchorEl(null);
                dispatch(
                  removeMultipleColumns(columnIds.filter((id) => id !== null))
                );
              }}
            >
              Remove all columns
            </ListItemButton>
          </List>
        </Popover>
      </div>
      {columnIds.map((columnId) => (
        <ColumnContainer
          key={columnId}
          id={columnId}
          index={jIndex}
          // tableId={tables[i].id}
        >
          <ColumnBlockView />
        </ColumnContainer>
      ))}
    </form>
  );
}
