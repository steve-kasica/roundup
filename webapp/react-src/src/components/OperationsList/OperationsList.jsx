import { List } from "@mui/material";
import { useSelector } from "react-redux";
import { getOperations } from "../../data/selectors";
import OperationContainer from "../OperationContainer/OperationContainer";
import { OPERATION_LAYOUT_LIST_ITEM } from "../OperationContainer";

import "./OperationsList.scss";

export default function OperationsList() {
    const operations = useSelector(getOperations);

    return (
        <List className="OperationsList" dense>
            {operations.map(operation => (
                <OperationContainer
                    key={operation.id}
                    id={operation.id}
                    layout={OPERATION_LAYOUT_LIST_ITEM}
                />
            ))}
        </List>
    );
}