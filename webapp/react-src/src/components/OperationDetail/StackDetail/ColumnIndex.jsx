import { useDispatch, useSelector } from "react-redux";
import { Box, IconButton, List, ListItemButton, Popover } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import ChevronDownIcon from "@mui/icons-material/ExpandMore";
import { memo, useRef } from "react";
import {
  selectColumnById,
  selectColumnIdsByIndex,
  setColumnDragStatus,
  setColumnHoveredStatus,
} from "../../../data/slices/columnsSlice";
import ColumnBlockView from "./ColumnBlockView";
import { useDrag, useDrop } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";
import { swapColumnIndices } from "../../../data/sagas/swapColumnIndicesSaga";
import {
  setDrawerContents,
  setSelectedColumns,
} from "../../../data/slices/uiSlice/uiSlice";

export const COLUMN_INDEX = "COLUMN_INDEX";

const ColumnIndex = memo(function ColumnIndex({ jIndex, tables }) {
  const dispatch = useDispatch();
  const tableIds = useMemo(() => tables.map(({ id }) => id), [tables]);

  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const isMenuOpen = Boolean(menuAnchorEl);
  const [isMenuIconVisable, setIsMenuIconVisible] = useState(false);

  const formRef = useRef(null);

  // Note: selector is memoized, so it won't recompute unless the input changes
  const columnIds = useSelector((state) =>
    selectColumnIdsByIndex(state, jIndex, tableIds)
  );

  const columns = useSelector((state) =>
    columnIds.filter(Boolean).map((id) => selectColumnById(state, id))
  );
  const isExpanded = columns.some((column) => column.status.isSelected);
  const maxColumnNameLength = Math.max(
    ...columns.map(({ name }) => name.length),
    0
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

  // Disable the default drag preview
  useEffect(() => {
    previewRef(getEmptyImage(), { captureDraggingState: true });
  }, []);

  const index1 = jIndex + 1;

  const menuItems = [
    {
      // TODO
      // label: "Select all columns to the right",
      // action: () => dispatch(setColumnSelectedStatusAfterIndex({ jIndex })),
    },
    {
      label: "Compare unique values",
      action: () => dispatch(setDrawerContents("IndexUniqueValues")),
    },
  ];

  const defaultFormWidth = 10;
  const headerRef = useRef(null);

  return (
    <form
      ref={formRef}
      className="ColumnIndex"
      data-columnIds={columnIds.join(",")}
      style={{
        width:
          isExpanded & (maxColumnNameLength > defaultFormWidth)
            ? `${maxColumnNameLength + 5}ch`
            : `${defaultFormWidth}ch`,
        transition: "width 0.3s ease-in-out",
      }}
    >
      <Box
        ref={(node) => {
          dragRef(dropRef(node));
        }}
        className="index-label"
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
          // Select column vector on header click
          if (!isMenuOpen) {
            dispatch(setSelectedColumns(columnIds));
          }
        }}
      >
        <div ref={headerRef}>
          <label>{index1}</label>
          <IconButton
            size="small"
            sx={{
              position: "absolute",
              right: 0,
              padding: 0,
              top: 4,
              opacity: isMenuIconVisable ? 1 : 0,
            }}
            onClick={(event) => {
              // Prevent paraent onClick event from firing (column selection)
              event.stopPropagation();
              // Open the menu on icon button click
              setMenuAnchorEl(event.currentTarget);
            }}
          >
            <ChevronDownIcon />
          </IconButton>
        </div>
        <Popover
          open={isMenuOpen}
          anchorEl={menuAnchorEl}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          onClose={({ clientX, clientY }) => {
            // use headerRef since currentTarget is the modal background
            const bbox = headerRef.current.getBoundingClientRect();
            const isMouseOverHeader =
              clientX >= bbox.left &&
              clientX <= bbox.right &&
              clientY >= bbox.top &&
              clientY <= bbox.bottom;

            if (!isMouseOverHeader) {
              dispatch(
                setColumnHoveredStatus({ ids: columnIds, isHovered: false })
              );
              setIsMenuIconVisible(false);
            }
            setMenuAnchorEl(null);
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
      {/* TODO: not sure why this has to be reversed */}
      {[...columnIds].reverse().map((columnId) => (
        <ColumnBlockView key={columnId} isDraggable={true} id={columnId} />
      ))}
    </form>
  );
});

export default ColumnIndex;
