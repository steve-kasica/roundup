import { ListItemIcon, ListItemText, MenuItem } from "@mui/material";
import { PackOperationIcon } from "../../../ui/icons";
import { useSelector } from "react-redux";
import {
  selectFocusedObject,
  selectSelectedTableIds,
} from "../../../../slices/uiSlice";
import { useMemo } from "react";
import { selectRootOperationId } from "../../../../slices/operationsSlice";

const PackMenuItem = ({ onClick }) => {
  const focusedObject = useSelector(selectFocusedObject);
  const rootOperationId = useSelector(selectRootOperationId);
  const selectedTableIds = useSelector(selectSelectedTableIds);

  const isEnabled = useMemo(
    () =>
      (rootOperationId === null && selectedTableIds.length === 2) ||
      (rootOperationId === focusedObject?.id && selectedTableIds.length === 1),
    [focusedObject?.id, rootOperationId, selectedTableIds.length],
  );

  return (
    <MenuItem onClick={onClick} disabled={!isEnabled}>
      <ListItemIcon>
        <PackOperationIcon />
      </ListItemIcon>
      <ListItemText>
        Pack table{selectedTableIds.length !== 1 ? "s" : ""}
      </ListItemText>
    </MenuItem>
  );
};

export default PackMenuItem;
