
import { ListItemButton, ListItemText } from "@mui/material";

export const LAYOUT_ID = "operationListItem";

export default function OperationListItemView({
    id,
    parentId,
    operationType,
    children,
    depth,
    isFocused
 }) {
    return (
        <ListItemButton 
            selected={isFocused}
        >
            <ListItemText
                primary={`${depth}. ${operationType}`}
            />
        </ListItemButton>
    );
}