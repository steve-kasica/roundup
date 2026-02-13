import { ListItemIcon, ListItemText, MenuItem } from "@mui/material";
import { PackOperationIcon } from "../../../ui/icons";
import { useSelector } from "react-redux";
import { selectFocusedObject } from "../../../../slices/uiSlice";
import { useMemo } from "react";
import { isTableId } from "../../../../slices/tablesSlice";
import { selectRootOperationId } from "../../../../slices/operationsSlice";

const PackMenuItem = ({ onClick, selectedCount }) => {
  const focusedObject = useSelector(selectFocusedObject);
  const rootOperationId = useSelector(selectRootOperationId);

  const isDisabled = useMemo(
    () =>
      selectedCount !== 1 ||
      !focusedObject ||
      isTableId(focusedObject?.id) ||
      focusedObject?.id !== rootOperationId,
    [focusedObject, selectedCount, rootOperationId],
  );

  return (
    <MenuItem onClick={onClick} disabled={isDisabled}>
      <ListItemIcon>
        <PackOperationIcon />
      </ListItemIcon>
      <ListItemText>Pack table{selectedCount !== 1 ? "s" : ""}</ListItemText>
    </MenuItem>
  );
};

export default PackMenuItem;
