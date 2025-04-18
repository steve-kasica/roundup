import { List, ListItemText, ListItemButton } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { focusOperation, hoverOperation, unhoverOperation } from "../../data/uiSlice";
import { getHoverOperationId, getOperations } from "../../data/selectors";

export default function OperationsList() {
    const dispatch = useDispatch();
    const operations = useSelector(getOperations).map(operation => ({
        ...operation
    }));

    return (
        <>
            <List dense>
            {operations.map((op, i) => (
                <ListItemButton 
                    key={op.id}
                    selected={op.isSelected}
                    // onMouseEnter={() => dispatch(hoverOperation(op.id))}
                    // onMouseLeave={() => dispatch(unhoverOperation())}
                    // onClick={() => dispatch(focusOperation(op.id))}
                >
                    <ListItemText
                        primary={`${i + 1}. ${op.operationType}`}
                    />
                </ListItemButton>
            ))}
            </List>
        </>
    );
}