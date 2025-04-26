import { useDispatch, useSelector } from "react-redux";
import { Box, IconButton, List, ListItemButton, Popover } from "@mui/material";
import { useState } from "react";
import ChevronDownIcon from "@mui/icons-material/ExpandMore";
import { memo } from "react";
import {
  clearSelectedColumns,
  selectColumnIdsByIndex,
  setColumnHoverStatus,
  setColumnSelectedStatus,
  setColumnSelectedStatusAfterIndex,
} from "../../../data/slices/columnsSlice";
import { ColumnContainer } from "../../Containers";
import ColumnBlockView from "./ColumnBlockView";
import { removeColumns } from "../../../data/sagas/removeColumnsSaga";

const ColumnIndex = memo(function ColumnIndex({ jIndex }) {
  const dispatch = useDispatch();
  const [anchorEl, setAnchorEl] = useState(null);
  const [isMenuIconVisable, setIsMenuIconVisible] = useState(false);
  const isPopoverOpen = Boolean(anchorEl);

  const columnIds = useSelector((state) =>
    selectColumnIdsByIndex(state, jIndex)
  );

  const index1 = jIndex + 1;

  const menuItems = [
    {
      label: "Remove all columns at index",
      action: () => dispatch(removeColumns(columnIds)),
    },
    {
      label: "Select all columns to the right",
      action: () => dispatch(setColumnSelectedStatusAfterIndex({ jIndex })),
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
        }}
        onMouseEnter={() => {
          setIsMenuIconVisible(true);
          columnIds.forEach((id) => {
            dispatch(setColumnHoverStatus({ id, isHovered: true }));
          });
        }}
        onMouseLeave={() => {
          setIsMenuIconVisible(false);
          columnIds.forEach((id) => {
            dispatch(setColumnHoverStatus({ id, isHovered: false }));
          });
        }}
        onClick={() => {
          if (!isPopoverOpen) {
            dispatch(clearSelectedColumns());
            columnIds.forEach((id) => {
              dispatch(setColumnSelectedStatus({ id, isSelected: true }));
            });
          }
        }}
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
          isDraggable={true}
        >
          <ColumnBlockView />
        </ColumnContainer>
      ))}
    </form>
  );
});

export default ColumnIndex;
