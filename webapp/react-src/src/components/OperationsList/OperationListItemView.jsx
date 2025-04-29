import { ListItemButton, ListItemText } from "@mui/material";

export const LAYOUT_ID = "operationListItem";

export default function OperationListItemView({
  operation,
  index,
  columnCount,
}) {
  const { operationType } = operation;

  return (
    <ListItemButton>
      <ListItemText
        primary={`${index + 1}. ${operationType}`}
        secondary={columnCount}
      />
    </ListItemButton>
  );
}
