import { List } from "@mui/material";
import { useSelector } from "react-redux";
import { selectAllOperationIds } from "../../data/slices/operationsSlice";
import { OperationContainer } from "../Containers";

import "./OperationsList.scss";
import OperationListItemView from "./OperationListItemView";

export default function OperationsList() {
  const operationIds = useSelector(selectAllOperationIds);

  return (
    <List className="OperationsList" dense>
      {operationIds
        .slice()
        .reverse()
        .map((operationId, i) => (
          <OperationContainer key={operationId} id={operationId}>
            <OperationListItemView index={i} />
          </OperationContainer>
        ))}
    </List>
  );
}
