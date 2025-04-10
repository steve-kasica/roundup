import { List, ListItemText, ListItemButton } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedOperation } from "../../data/uiSlice";
import { getOperations } from "../../data/selectors";

export default function OperationsList() {
    const dispatch = useDispatch();
    const operations = useSelector(getOperations);

    return (
        <>
            <h3>Operations list</h3>
            <List dense>
            {operations.map((op, i) => (
                <ListItemButton 
                    key={op.id}
                    selected={false}
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