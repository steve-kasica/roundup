
import { ListItemButton } from "@mui/material";

export default function OperationListItemView({
    id,
    parentId,
    operationType,
    children,
    maxColumns,
    isFocused,
    depth,
    handleOnHover,
    handleOffHover,
    handleOnFocus
 }) {
    return (
        <ListItemButton 
            selected={isFocused}
            onMouseEnter={handleOnHover}
            onMouseLeave={handleOffHover}
            onClick={handleOnFocus}
    >
        <ListItemText
            primary={`${depth + 1}. ${operationType}`}
        />
    </ListItemButton>
    );
}