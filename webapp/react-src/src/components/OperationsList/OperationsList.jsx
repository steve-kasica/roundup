import { List } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { getOperations } from "../../data/selectors";
import { OperationContainer } from "../Containers";

import "./OperationsList.scss";
import OperationListItemView from "./OperationListItemView";
import { setSelectedOperationId } from "../../data/slices/uiSlice";
export default function OperationsList() {
  const dispatch = useDispatch();
  const operations = useSelector(getOperations);

  return (
    <List className="OperationsList" dense>
      {operations.map((operation) => (
        <OperationContainer
          key={operation.id}
          id={operation.id}
          onClick={() => dispatch(setSelectedOperationId(operation.id))}
        >
          <OperationListItemView />
        </OperationContainer>
      ))}
    </List>
  );
}
