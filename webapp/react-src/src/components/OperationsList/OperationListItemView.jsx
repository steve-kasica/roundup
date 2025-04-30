import { ListItemButton, ListItemText } from "@mui/material";
import { setFocusedOperation } from "../../data/slices/operationsSlice";
import { useDispatch } from "react-redux";

export const LAYOUT_ID = "operationListItem";

export default function OperationListItemView({
  operation,
  index,
  columnCount,
}) {
  const dispatch = useDispatch();
  const { operationType, id, tableIds } = operation;

  const label = operationType.charAt(0).toUpperCase() + operationType.slice(1);
  const position = index + 1;

  return (
    <ListItemButton onClick={() => dispatch(setFocusedOperation({ id }))}>
      <ListItemText
        primary={`${position}. ${label} (${columnCount})`}
        secondary={tableIds.join(", ")}
      />
    </ListItemButton>
  );
}
