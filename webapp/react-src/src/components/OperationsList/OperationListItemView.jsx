import { ListItemButton, ListItemText } from "@mui/material";

export const LAYOUT_ID = "operationListItem";

export default function OperationListItemView({ operation, columnCount }) {
  const { depth, operationType } = operation;
  const isFocused = false;
  return (
    <ListItemButton selected={isFocused}>
      <ListItemText
        primary={`${depth}. ${operationType}`}
        secondary={columnCount}
      />
    </ListItemButton>
  );
}
