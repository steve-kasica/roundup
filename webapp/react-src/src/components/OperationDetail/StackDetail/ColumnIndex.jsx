import { useDispatch } from "react-redux";
import {
  addToSelectedColumnIds,
  clearSelectedColumnIds,
  setHoverColumnIndex,
  toggleSelectedColumnIds,
  unsetHoverColumnIndex,
} from "../../../data/slices/uiSlice";
import { useSelector } from "react-redux";
import { getColumnIdsByIndex } from "../../../data/selectors";
import { ColumnContainer } from "../../Containers";
import ColumnBlockView from "./ColumnBlockView";
import { Box, IconButton, List, ListItemButton, Popover } from "@mui/material";
import { useMemo, useState } from "react";
import ChevronDownIcon from "@mui/icons-material/ExpandMore";
import { removeColumns } from "../../../data/sagas/removeColumnsSaga";
import { memo } from "react";

const ColumnIndex = memo(function ColumnIndex({ jIndex }) {
  const dispatch = useDispatch();
  const [anchorEl, setAnchorEl] = useState(null);
  const [isMenuIconVisable, setIsMenuIconVisible] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const isPopoverOpen = Boolean(anchorEl);

  const columnIds = useSelector((state) => getColumnIdsByIndex(state, jIndex));

  const index1 = jIndex + 1;

  const menuItems = [
    {
      label: "Select columns in index",
      action: () => dispatch(addToSelectedColumnIds(columnIds)),
    },
    {
      label: "Remove columns in index",
      action: () => dispatch(removeColumns(columnIds)),
    },
    {
      label: "Select all columns to the right",
      action: () => null,
      // TODO: implement logic to select all columns to the right
      // dispatch(addToSelectedColumnIds(allColumnIds));
    },
  ];

  // const memoizedChildren = useMemo(() => {
  //   return columnIds.map((columnId) => (
  //     <ColumnContainer key={columnId} id={columnId} index={jIndex}>
  //       <ColumnBlockView />
  //     </ColumnContainer>
  //   ));
  // }, [columnIds, jIndex]);

  return (
    <form key={`index-${jIndex}`}>
      <Box
        className="index-label"
        sx={{
          textAlign: "center",
          padding: "4px",
          position: "relative",
          border: "1px solid #000",
          cursor: isSelected ? "grab" : "default",
          backgroundColor: isSelected ? "#e0e0e0" : "#fff",
        }}
        onMouseEnter={() => {
          dispatch(setHoverColumnIndex(jIndex));
          setIsMenuIconVisible(true);
        }}
        onMouseLeave={() => {
          dispatch(unsetHoverColumnIndex(jIndex));
          setIsMenuIconVisible(false);
        }}
        // onClick={(event) => {
        //   if (event.ctrlKey) {
        //     dispatch(toggleSelectedColumnIds(columnIds));
        //   } else {
        //     dispatch(clearSelectedColumnIds());
        //     dispatch(addToSelectedColumnIds(columnIds));
        //   }
        // }}
      >
        <label>{index1}</label>
        <IconButton
          size="small"
          sx={{
            position: "absolute",
            right: 0,
            padding: 0,
            top: 0,
            opacity: isMenuIconVisable ? 1 : 0,
          }}
          onClick={(event) => setAnchorEl(event.currentTarget)}
        >
          <ChevronDownIcon />
        </IconButton>
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
            {menuItems.map((item, index) => (
              <ListItemButton
                key={index}
                onClick={() => {
                  item.action();
                  setAnchorEl(null);
                }}
              >
                {item.label}
              </ListItemButton>
            ))}
          </List>
        </Popover>
      </Box>
      {columnIds.map((columnId) => (
        <ColumnContainer
          key={columnId}
          id={columnId}
          index={jIndex}
          onClickHandler={() => dispatch(toggleSelectedColumnIds(columnId))}
        >
          <ColumnBlockView />
        </ColumnContainer>
      ))}
    </form>
  );
});

export default ColumnIndex;
