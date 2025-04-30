import { useDispatch, useSelector } from "react-redux";
import { Box, IconButton, List, ListItemButton, Popover } from "@mui/material";
import { useEffect, useState } from "react";
import ChevronDownIcon from "@mui/icons-material/ExpandMore";
import { memo } from "react";
import {
  clearSelectedColumns,
  selectColumnIdsByIndex,
  setColumnDragStatus,
  setColumnHoveredStatus,
  setColumnSelectedStatus,
  setColumnSelectedStatusAfterIndex,
} from "../../../data/slices/columnsSlice";
import { ColumnContainer } from "../../Containers";
import ColumnBlockView from "./ColumnBlockView";
import { removeColumns } from "../../../data/sagas/removeColumnsSaga";
import { useDrag, useDrop } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";
import { swapColumnIndices } from "../../../data/sagas/swapColumnIndicesSaga";

export const COLUMN_INDEX = "COLUMN_INDEX";

const ColumnIndex = memo(function ColumnIndex({ jIndex, tableIds }) {
  const dispatch = useDispatch();
  const [anchorEl, setAnchorEl] = useState(null);
  const [isSelected, setIsSelected] = useState(false);
  const [isMenuIconVisable, setIsMenuIconVisible] = useState(false);
  const isPopoverOpen = Boolean(anchorEl);

  const columnIds = useSelector((state) =>
    selectColumnIdsByIndex(state, jIndex, tableIds)
  );

  const [{ isDragging }, dragRef, previewRef] = useDrag({
    type: COLUMN_INDEX,
    item: () => {
      return { columnIds, jIndex };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: () => {
      // This is called when the drag operation ends
      columnIds.forEach((id) => {
        dispatch(setColumnDragStatus({ id, isDragging: false }));
        dispatch(setColumnHoveredStatus({ id, isHovered: false }));
      });
    },
  });

  useEffect(() => {
    columnIds.forEach((id) => {
      dispatch(setColumnDragStatus({ id, isDragging }));
    });
  }, [isDragging, columnIds, dispatch]);

  const [{ isHovered }, dropRef] = useDrop({
    accept: COLUMN_INDEX,
    drop: (droppedItem) => {
      // Remember, in this context `droppedItem.columnIds` === `columnIds` in useDrag
      if (droppedItem.jIndex !== jIndex) {
        dispatch(
          swapColumnIndices({
            sourceColumnIds: droppedItem.columnIds,
            targetColumnIds: columnIds,
          })
        );
      }
    },
    collect: (monitor) => ({
      isHovered: monitor.isOver(),
    }),
  });

  // useEffect(() => {
  //   columnIds.forEach((id) => {
  //     dispatch(setColumnHoveredStatus({ id, isHovered }));
  //   });
  // }, [isHovered, columnIds, dispatch]);

  // Disable the default drag preview
  useEffect(() => {
    previewRef(getEmptyImage(), { captureDraggingState: true });
  }, []);

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

  return (
    <form className="ColumnIndex" data-columnIds={columnIds.join(",")}>
      <Box
        ref={(node) => {
          dragRef(dropRef(node));
        }}
        className="index-label"
        sx={{
          textAlign: "center",
          padding: "4px",
          position: "relative",
          border: "1px solid #000",
        }}
        // onMouseEnter={() => {
        //   setIsMenuIconVisible(true);
        //   columnIds.forEach((id) => {
        //     dispatch(setColumnHoveredStatus({ id, isHovered: true }));
        //   });
        // }}
        // onMouseLeave={() => {
        //   setIsMenuIconVisible(false);
        //   columnIds.forEach((id) => {
        //     dispatch(setColumnHoveredStatus({ id, isHovered: false }));
        //   });
        // }}
        onClick={() => {
          if (!isPopoverOpen) {
            dispatch(clearSelectedColumns());
            setIsSelected(!isSelected);
            columnIds.forEach((id) => {
              dispatch(setColumnSelectedStatus({ id, isSelected }));
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
