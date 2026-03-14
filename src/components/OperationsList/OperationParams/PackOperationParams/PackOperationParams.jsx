import {
  Box,
  Button,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import { CheckCircle, HourglassEmpty, WarningAmber } from "@mui/icons-material";
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useDispatch } from "react-redux";
import { withAssociatedAlerts, withPackOperationData } from "../../../HOC";
import JoinColumnsSelect from "./JoinColumnsSelect";
import JoinPredicateSelect from "./JoinPredicateSelect";
import { updateOperationsRequest } from "../../../../sagas/updateOperationsSaga";
import TableOrderRadio from "./TableOrderRadio";
import { IntegerNumber } from "../../../ui/text";
import { deleteOperationsRequest } from "../../../../sagas/deleteOperationsSaga/actions";

const PackOperationParams = ({
  // Props passed via withPackOperationData HOC
  name,
  leftTableId,
  leftColumnIds = [],
  rightColumnIds = [],
  rightTableId,
  leftKey,
  rightKey,
  joinPredicate,
  columnCount,
  rowCount,
  isMaterialized,
  isInSync,
  // Props passed directly from parent OperationSelect.jsx
  id,
  isReadOnly,
  // Props passed via withAssociatedAlerts HOC
  totalCount = 0,
}) => {
  const dispatch = useDispatch();
  const [nameLocal, setNameLocal] = useState(name || "Op.");
  const [inputValue, setInputValue] = useState(name || "Op.");
  const debounceTimerRef = useRef(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [leftTableIdLocal, setLeftTableIdLocal] = useState(leftTableId);
  const [rightTableIdLocal, setRightTableIdLocal] = useState(rightTableId);
  const [leftColumnKeyIdLocal, setLeftColumnKeyIdLocal] = useState(leftKey);
  const [rightColumnKeyIdLocal, setRightColumnKeyIdLocal] = useState(rightKey);
  const [joinPredicateState, setJoinPredicateState] = useState(joinPredicate);

  // Sync local state with props when operation changes
  useEffect(() => {
    setLeftTableIdLocal(leftTableId);
    setRightTableIdLocal(rightTableId);
    setLeftColumnKeyIdLocal(leftKey);
    setRightColumnKeyIdLocal(rightKey);
    setJoinPredicateState(joinPredicate);
    setNameLocal(name || "Op.");
    setInputValue(name || "Op.");
  }, [id, leftTableId, rightTableId, leftKey, rightKey, joinPredicate, name]);

  const hasChanges = useMemo(() => {
    return (
      nameLocal !== (name || "Op.") ||
      leftColumnKeyIdLocal !== leftKey ||
      rightColumnKeyIdLocal !== rightKey ||
      joinPredicateState !== joinPredicate ||
      leftTableIdLocal !== leftTableId ||
      rightTableIdLocal !== rightTableId
    );
  }, [
    leftTableId,
    rightTableId,
    nameLocal,
    name,
    leftColumnKeyIdLocal,
    leftKey,
    rightColumnKeyIdLocal,
    rightKey,
    joinPredicateState,
    joinPredicate,
    leftTableIdLocal,
    rightTableIdLocal,
  ]);

  const handleNameChange = useCallback((e) => {
    const value = e.target.value;
    setInputValue(value);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setNameLocal(value);
    }, 300);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleUpdate = useCallback(
    (e) => {
      e.preventDefault();
      const localChildIds = [leftTableIdLocal, rightTableIdLocal];

      const formData = {
        id,
        name: nameLocal,
        childIds: localChildIds,
        joinKey1: leftColumnKeyIdLocal,
        joinKey2: rightColumnKeyIdLocal,
        joinPredicate: joinPredicateState,
        matchStats: {}, // will be set in updateOperationsSaga/worker
      };

      dispatch(updateOperationsRequest([formData]));
    },
    [
      leftTableIdLocal,
      rightTableIdLocal,
      id,
      nameLocal,
      leftColumnKeyIdLocal,
      rightColumnKeyIdLocal,
      joinPredicateState,
      dispatch,
    ],
  );

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

  const handleJoinColumnsSelectChange = useCallback((leftKeyId, rightKeyId) => {
    setLeftColumnKeyIdLocal(leftKeyId);
    setRightColumnKeyIdLocal(rightKeyId);
  }, []);

  const handleTableOrderChange = useCallback((left, right) => {
    setLeftTableIdLocal(left);
    setRightTableIdLocal(right);
  }, []);

  const attachedTableCount = useMemo(
    () => [leftTableIdLocal, rightTableIdLocal].filter(Boolean).length,
    [leftTableIdLocal, rightTableIdLocal],
  );

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
      className="PackOperationParams"
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
              <IntegerNumber value={attachedTableCount} />
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
              {isNaN(rowCount) ? "Unknown" : <IntegerNumber value={rowCount} />}
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
          Join parameters
        </Typography>
        {/* <JoinSummary joinPredicate={joinPredicate} /> */}
        <TableOrderRadio
          childIds={[leftTableIdLocal, rightTableIdLocal]}
          onChange={handleTableOrderChange}
          isDisabled={isReadOnly}
        />

        <JoinColumnsSelect
          leftTableId={leftTableIdLocal}
          rightTableId={rightTableIdLocal}
          leftColumnIds={
            leftTableIdLocal === leftTableId ? leftColumnIds : rightColumnIds
          }
          rightColumnIds={
            rightTableIdLocal === rightTableId ? rightColumnIds : leftColumnIds
          }
          leftKeyId={
            leftTableIdLocal === leftTableId
              ? leftColumnKeyIdLocal
              : rightColumnKeyIdLocal
          }
          rightKeyId={
            rightTableIdLocal === rightTableId
              ? rightColumnKeyIdLocal
              : leftColumnKeyIdLocal
          }
          onChange={handleJoinColumnsSelectChange}
          sx={{
            mb: 1,
          }}
          isDisabled={isReadOnly}
        />
        <JoinPredicateSelect
          value={joinPredicateState}
          onChange={(newPredicate) => {
            setJoinPredicateState(newPredicate);
          }}
          sx={{
            mb: 1,
          }}
          isDisabled={isReadOnly}
        />
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          pt: 2,
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={handleDeleteClick}
          disabled={isReadOnly}
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
        aria-labelledby="pack-operation-delete-title"
        aria-describedby="pack-operation-delete-description"
      >
        <DialogTitle id="pack-operation-delete-title">
          Delete pack operation?
        </DialogTitle>
        <DialogContent id="pack-operation-delete-description">
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

const EnhancedPackOperationParams = withAssociatedAlerts(
  withPackOperationData(PackOperationParams),
);
export { EnhancedPackOperationParams, PackOperationParams };
