import { ListItemIcon, ListItemText, MenuItem } from "@mui/material";
import { PlaylistAdd } from "@mui/icons-material";
import { useSelector } from "react-redux";
import { selectFocusedObject } from "../../../../slices/uiSlice";
import { useMemo } from "react";
import { isTableId } from "../../../../slices/tablesSlice";
import {
  OPERATION_TYPE_PACK,
  selectRootOperationId,
} from "../../../../slices/operationsSlice";

const AppendMenuItem = ({ onClick, selectedCount }) => {
  const focusedObject = useSelector(selectFocusedObject);
  const rootOperationId = useSelector(selectRootOperationId);

  const isDisabled = useMemo(
    () =>
      selectedCount === 0 ||
      !focusedObject ||
      isTableId(focusedObject?.id) ||
      (focusedObject?.operationType === OPERATION_TYPE_PACK &&
        focusedObject?.childIds?.length === 2) ||
      (rootOperationId !== null && focusedObject?.id !== rootOperationId),
    [focusedObject, selectedCount, rootOperationId],
  );

  return (
    <MenuItem onClick={onClick} disabled={isDisabled}>
      <ListItemIcon>
        <PlaylistAdd />
      </ListItemIcon>
      <ListItemText>Insert table</ListItemText>
    </MenuItem>
  );
};

export default AppendMenuItem;
