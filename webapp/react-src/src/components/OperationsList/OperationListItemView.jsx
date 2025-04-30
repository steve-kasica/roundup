import { ListItemButton, ListItemText } from "@mui/material";

export const LAYOUT_ID = "operationListItem";

export default function OperationListItemView({
  operation,
  index,
  columnCount,
}) {
  const { operationType } = operation;

  const label = operationType.charAt(0).toUpperCase() + operationType.slice(1);
  const position = index + 1;

  return (
    <ListItemButton>
      <ListItemText
        primary={`${position}. ${label} (${columnCount})`}
        secondary={operation.tableIds.join(", ")}
      />
    </ListItemButton>
  );
}
