import { Box, ListItemButton, ListItemIcon, Typography } from "@mui/material";
import useDragAndDrop from "../../../../hooks/useDragAndDrop";
import { EnhancedTableLabel } from "../../../TableView";
import { EnhancedOperationLabel } from "../../../OperationView/OperationLabel";
import { isTableId, selectTablesById } from "../../../../slices/tablesSlice";
import { selectOperationsById } from "../../../../slices/operationsSlice";
import { DragIndicator } from "@mui/icons-material";
import { useSelector } from "react-redux";

const StackTableOrderItem = ({
  childId,
  index,
  dragType,
  isReadOnly,
  onMove,
}) => {
  const { name } = useSelector((state) =>
    isTableId(childId)
      ? selectTablesById(state, childId)
      : selectOperationsById(state, childId),
  );

  const { dragRef, dropRef, isDragging, isOver, canDropHere } = useDragAndDrop({
    dragType,
    dropType: dragType,
    getDragItem: () => ({
      id: childId,
      index,
      name,
      isTable: isTableId(childId),
    }),
    canDrag: () => !isReadOnly,
    canDrop: (item) => !isReadOnly && item?.id !== childId,
    onDrop: (item) => {
      if (!item || item.id === childId) return;
      onMove(item.id, childId);
    },
    hideDefaultPreview: true,
  });

  const isDropTarget = canDropHere && isOver && !isReadOnly;
  const isValidDropZone = canDropHere && !isOver && !isDragging && !isReadOnly;

  return (
    <ListItemButton
      ref={dropRef}
      disabled={isReadOnly}
      sx={{
        opacity: isDragging ? 0.4 : 1,
        borderRadius: 1,
        border: "1px solid",
        borderStyle: isValidDropZone ? "dashed" : "solid",
        borderColor: isDropTarget
          ? "primary.main"
          : isValidDropZone
            ? "primary.light"
            : "divider",
        backgroundColor: isDropTarget
          ? "action.hover"
          : isValidDropZone
            ? "action.selected"
            : "transparent",
        mb: 1,
        transition: "all 0.15s ease-in-out",
      }}
    >
      <ListItemIcon ref={dragRef} sx={{ minWidth: 32, cursor: "grab" }}>
        <DragIndicator fontSize="small" color="action" />
      </ListItemIcon>
      <Box sx={{ flexGrow: 1 }}>
        {isTableId(childId) ? (
          <EnhancedTableLabel id={childId} includeDimensions={false} />
        ) : (
          <EnhancedOperationLabel id={childId} includeDimensions={false} />
        )}
      </Box>
      <Typography variant="caption" color="text.secondary">
        {index + 1}
      </Typography>
    </ListItemButton>
  );
};

export default StackTableOrderItem;
