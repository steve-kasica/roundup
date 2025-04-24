import { useDispatch } from "react-redux";
import {
  addToSelectedColumnIds,
  setHoverColumnIndex,
  unsetHoverColumnIndex,
} from "../../../data/slices/uiSlice";
import { useSelector } from "react-redux";
import { getColumnIdsByIndex } from "../../../data/selectors";
import { ColumnContainer } from "../../Containers";
import ColumnBlockView from "./ColumnBlockView";
import { List, ListItemButton, Popover } from "@mui/material";
import { useState } from "react";

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
        // onClick={(event) => setAnchorEl(anchorEl ? null : event.currentTarget)}
        onClick={() => dispatch(addToSelectedColumnIds(columnIds))}
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
                dispatch(addToSelectedColumnIds(columnIds));
              }}
            >
              Select columns in index
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
