import { List, ListItemText, ListItemButton } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { focusOperation } from "../../data/uiSlice";
import { getOperations } from "../../data/selectors";

export default function OperationsList() {
    const dispatch = useDispatch();
    const operations = useSelector(getOperations);

    return (
        <>
            <List dense>
            {operations.map(({id, operationType}, i) => (
                <ListItemButton 
                    key={id}
                    selected={false}
                    onClick={() => dispatch(focusOperation(id))}
                >
                    <ListItemText
                        primary={`${i + 1}. ${operationType}`}
                    />
                </ListItemButton>
            ))}
            </List>
        </>
    );
}