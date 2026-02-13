import { ListItemIcon, ListItemText, MenuItem } from "@mui/material";
import { StackOperationIcon } from "../../../ui/icons";
import { useSelector } from "react-redux";
import { selectRootOperationId } from "../../../../slices/operationsSlice";
import {
  selectFocusedObject,
  selectSelectedTableIds,
} from "../../../../slices/uiSlice";
import { useMemo } from "react";

const StackMenuItem = ({ onClick }) => {
  const rootOperationId = useSelector(selectRootOperationId);
  const focusedObject = useSelector(selectFocusedObject);
  const selectedTableIds = useSelector(selectSelectedTableIds);

  const selectedCount = useMemo(
    () => selectedTableIds.length,
    [selectedTableIds.length],
  );

  const isEnabled = useMemo(
    () =>
      (rootOperationId === null && selectedCount >= 2) ||
      (focusedObject?.id === rootOperationId && selectedCount >= 1),
    [selectedCount, focusedObject, rootOperationId],
  );

  return (
    <MenuItem onClick={onClick} disabled={!isEnabled}>
      <ListItemIcon>
        <StackOperationIcon />
      </ListItemIcon>
      <ListItemText>Stack table{selectedCount !== 1 ? "s" : ""}</ListItemText>
    </MenuItem>
  );
};

export default StackMenuItem;
