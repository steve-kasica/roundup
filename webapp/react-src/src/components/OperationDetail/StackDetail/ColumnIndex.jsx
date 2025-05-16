import { useDispatch, useSelector } from "react-redux";
import { Box, IconButton, List, ListItemButton, Popover } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import ChevronDownIcon from "@mui/icons-material/ExpandMore";
import { memo, useRef } from "react";
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
import IndexUniqueValues from "./IndexUniqueValues";

export const COLUMN_INDEX = "COLUMN_INDEX";

const ColumnIndex = memo(function ColumnIndex({ jIndex, tables }) {
  const dispatch = useDispatch();
  const tableIds = useMemo(() => tables.map(({ id }) => id), [tables]);
  // console.log("ColumnIndex", jIndex, tables);

  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const isPopoverOpen = Boolean(menuAnchorEl);
  const [isMenuIconVisable, setIsMenuIconVisible] = useState(false);

  const [detailAnchorEl, setDetailAnchorEl] = useState(null);
  const isDetailPopoverOpen = Boolean(detailAnchorEl);
  const formRef = useRef(null);

  // Note: selector is memoized, so it won't recompute unless the input changes
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
    // TODO: update trigger
    // {
    //   label: "Compute facets",
    //   action: () => dispatch(requestColumnValues({ columnIds })),
    // },
    {
      label: "Compare unique values",
      action: () => setDetailAnchorEl(formRef?.current),
    },
  ];

  return (
    <form
      ref={formRef}
      className="ColumnIndex"
      data-columnIds={columnIds.join(",")}
    >
      <Popover
        open={isDetailPopoverOpen}
        anchorEl={detailAnchorEl}
        onClose={() => setDetailAnchorEl(null)}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        sx={{
          zIndex: 1000,
        }}
        // TODO: add little arrow at the bottom of the popover
      >
        <IndexUniqueValues columnIds={columnIds} />
      </Popover>
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
        onMouseEnter={() => {
          setIsMenuIconVisible(true);
          dispatch(setColumnHoveredStatus({ ids: columnIds, isHovered: true }));
        }}
        onMouseLeave={() => {
          setIsMenuIconVisible(false);
          dispatch(
            setColumnHoveredStatus({ ids: columnIds, isHovered: false })
          );
        }}
        onClick={() => {
          if (!isPopoverOpen) {
            dispatch(clearSelectedColumns());
            dispatch(
              setColumnSelectedStatus({ ids: columnIds, isSelected: true })
            );
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
          onClick={(event) => setMenuAnchorEl(event.currentTarget)}
        >
          <ChevronDownIcon />
        </IconButton>
        <Popover
          open={isPopoverOpen}
          anchorEl={menuAnchorEl}
          onClose={() => setMenuAnchorEl(null)}
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
                  setMenuAnchorEl(null);
                }}
              >
                {item.label}
              </ListItemButton>
            ))}
          </List>
        </Popover>
      </Box>
      {columnIds.map((columnId) => (
        <ColumnBlockView key={columnId} isDraggable={true} id={columnId} />
        // TODO: delete
        // <ColumnContainer
        //   key={columnId}
        //   id={columnId}
        //   index={jIndex}
        //   isDraggable={true}
        // >
        // </ColumnContainer>
      ))}
    </form>
  );
});

export default ColumnIndex;
