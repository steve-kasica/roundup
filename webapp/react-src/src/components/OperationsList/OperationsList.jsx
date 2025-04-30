import { List } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { selectAllOperationIds } from "../../data/slices/operationsSlice";
import { OperationContainer } from "../Containers";

import "./OperationsList.scss";
import OperationListItemView from "./OperationListItemView";
import { setSelectedOperationId } from "../../data/slices/uiSlice";

export default function OperationsList() {
  const dispatch = useDispatch();
  const operationIds = useSelector(selectAllOperationIds);

  return (
    <List className="OperationsList" dense>
      {operationIds
        .slice()
        .reverse()
        .map((operationId, i) => (
          <OperationContainer
            key={operationId}
            id={operationId}
            onClick={() => dispatch(setSelectedOperationId(operationId))}
          >
            <OperationListItemView index={i} />
          </OperationContainer>
        ))}
    </List>
  );
}
