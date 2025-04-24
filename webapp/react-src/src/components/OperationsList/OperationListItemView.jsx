import { ListItemButton, ListItemText } from "@mui/material";

export const LAYOUT_ID = "operationListItem";

export default function OperationListItemView({ operation, columnCount }) {
  const { depth, operationType } = operation;

  return (
    <ListItemButton>
      <ListItemText
        primary={`${depth}. ${operationType}`}
        secondary={columnCount}
      />
    </ListItemButton>
  );
}
