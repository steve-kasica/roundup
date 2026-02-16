import {
  Box,
  Button,
  Chip,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItemButton,
  ListItemIcon,
  Stack,
  Typography,
} from "@mui/material";
import {
  CheckCircle,
  DragIndicator,
  HourglassEmpty,
  WarningAmber,
} from "@mui/icons-material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { withAssociatedAlerts, withStackOperationData } from "../../../HOC";
import { updateOperationsRequest } from "../../../../sagas/updateOperationsSaga";
import useDragAndDrop from "../../../../hooks/useDragAndDrop";
import { EnhancedTableLabel } from "../../../TableView";
import { EnhancedOperationLabel } from "../../../OperationView/OperationLabel";
import { isTableId } from "../../../../slices/tablesSlice";
import { IntegerNumber } from "../../../ui/text";
import { deleteOperationsRequest } from "../../../../sagas/deleteOperationsSaga/actions";

const arrayEquals = (left = [], right = []) => {
  if (left.length !== right.length) return false;
  return left.every((value, index) => value === right[index]);
};

const moveInList = (list, fromId, toId) => {
  const fromIndex = list.indexOf(fromId);
  const toIndex = list.indexOf(toId);
  if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
    return list;
  }
  const next = [...list];
  next.splice(fromIndex, 1);
  next.splice(toIndex, 0, fromId);
  return next;
};

const formatCount = (value) =>
  Number.isFinite(value) ? value.toLocaleString() : "Unknown";

const StackTableOrderItem = ({
  childId,
  index,
  dragType,
  isReadOnly,
  onMove,
}) => {
  const { combinedRef, isDragging, isOver, canDropHere } = useDragAndDrop({
    dragType,
    dropType: dragType,
    getDragItem: () => ({ id: childId, index }),
    canDrag: () => !isReadOnly,
    canDrop: (item) => !isReadOnly && item?.id !== childId,
    onDrop: (item) => {
      if (!item || item.id === childId) return;
      onMove(item.id, childId);
    },
  });

  const isDropTarget = canDropHere && isOver && !isReadOnly;

  return (
    <ListItemButton
      ref={combinedRef}
      disabled={isReadOnly}
      sx={{
        opacity: isDragging ? 0.5 : 1,
        borderRadius: 1,
        border: "1px solid",
        borderColor: isDropTarget ? "primary.main" : "divider",
        backgroundColor: isDropTarget ? "action.hover" : "transparent",
        mb: 1,
      }}
    >
      <ListItemIcon sx={{ minWidth: 32 }}>
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

const StackOperationParams = ({
  id,
  childIds = [],
  columnCount,
  rowCount,
  isMaterialized,
  isInSync,
  totalCount = 0,
  isReadOnly,
}) => {
  const dispatch = useDispatch();
  const [orderedChildIds, setOrderedChildIds] = useState(childIds);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    setOrderedChildIds(childIds);
  }, [id, childIds]);

  const dragType = useMemo(() => `STACK_TABLE_ORDER_${id}`, [id]);

  const handleMove = useCallback((fromId, toId) => {
    setOrderedChildIds((prev) => moveInList(prev, fromId, toId));
  }, []);

  const hasChanges = useMemo(
    () => !arrayEquals(orderedChildIds, childIds),
    [orderedChildIds, childIds],
  );

  const handleUpdate = useCallback(() => {
    dispatch(updateOperationsRequest([{ id, childIds: orderedChildIds }]));
  }, [dispatch, id, orderedChildIds]);

  const handleDelete = useCallback(() => {
    dispatch(deleteOperationsRequest([id]));
  }, [dispatch, id]);

  const handleDeleteClick = useCallback(() => {
    setIsDeleteDialogOpen(true);
  }, []);

  const handleDeleteCancel = useCallback(() => {
    setIsDeleteDialogOpen(false);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    handleDelete();
    setIsDeleteDialogOpen(false);
  }, [handleDelete]);

  const status = useMemo(() => {
    if (isMaterialized) {
      return isInSync ? "Materialized" : "Out of sync";
    }
    return "Not materialized";
  }, [isMaterialized, isInSync]);

  const statusIcon = useMemo(() => {
    if (isMaterialized && isInSync) {
      return <CheckCircle fontSize="small" color="success" />;
    }
    if (isMaterialized && !isInSync) {
      return <WarningAmber fontSize="small" color="warning" />;
    }
    return <HourglassEmpty fontSize="small" color="disabled" />;
  }, [isMaterialized, isInSync]);

  return (
    <Box
      className="StackOperationParams"
      component={"form"}
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: 2,
        height: "100%",
      }}
    >
      <Box flexGrow={1} overflow={"auto"}>
        <Typography variant="h5" gutterBottom sx={{ my: 1 }}>
          Stats
        </Typography>
        <Stack spacing={1} sx={{ mb: 2 }}>
          <Stack direction="row" justifyContent="space-between" gap={2}>
            <Typography variant="subtitle2" color="text.secondary">
              Number of tables
            </Typography>
            <Typography variant="subtitle2" color="text.secondary">
              <IntegerNumber value={childIds.length} />
            </Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between" gap={2}>
            <Typography variant="subtitle2" color="text.secondary">
              Expected columns
            </Typography>
            <Typography variant="subtitle2" color="text.secondary">
              <IntegerNumber value={columnCount} />
            </Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between" gap={2}>
            <Typography variant="subtitle2" color="text.secondary">
              Expected rows
            </Typography>
            <Typography variant="subtitle2" color="text.secondary">
              <IntegerNumber value={rowCount} />
            </Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between" gap={2}>
            <Typography variant="subtitle2" color="text.secondary">
              Alerts
            </Typography>
            <Typography variant="subtitle2" color="text.secondary">
              <IntegerNumber value={totalCount} />
            </Typography>
          </Stack>
          <Stack direction="row" justifyContent={"space-between"} gap={1}>
            <Typography variant="subtitle2" color="text.secondary">
              Status
            </Typography>
            <Stack direction="row" alignItems="center" gap={0.5}>
              {statusIcon}
              <Typography variant="subtitle2" color="text.secondary">
                {status}
              </Typography>
            </Stack>
          </Stack>
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h5" gutterBottom sx={{ my: 1 }}>
          Table order
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Drag tables to reorder the stack output.
        </Typography>
        {orderedChildIds.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No tables are attached to this stack operation yet.
          </Typography>
        ) : (
          <List dense disablePadding>
            {orderedChildIds.map((childId, index) => (
              <StackTableOrderItem
                key={childId}
                childId={childId}
                index={index}
                dragType={dragType}
                isReadOnly={isReadOnly}
                onMove={handleMove}
              />
            ))}
          </List>
        )}
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          mt: 3,
          pt: 2,
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={handleDeleteClick}
          sx={{ mr: 2 }}
        >
          Delete
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleUpdate}
          disabled={!hasChanges || isReadOnly}
        >
          Update
        </Button>
      </Box>
      <Dialog
        open={isDeleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="stack-operation-delete-title"
        aria-describedby="stack-operation-delete-description"
      >
        <DialogTitle id="stack-operation-delete-title">
          Delete stack operation?
        </DialogTitle>
        <DialogContent id="stack-operation-delete-description">
          <Typography variant="body2" color="text.secondary">
            This will remove the operation and disconnect its tables. This
            action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const EnhancedStackOperationParams = withAssociatedAlerts(
  withStackOperationData(StackOperationParams),
);

export { StackOperationParams, EnhancedStackOperationParams };
