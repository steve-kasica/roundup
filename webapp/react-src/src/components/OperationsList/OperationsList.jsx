import { List } from "@mui/material";
import { useSelector } from "react-redux";
import { getOperations } from "../../data/selectors";
import { OperationContainer } from "../Containers";

import "./OperationsList.scss";
import OperationListItemView from "./OperationListItemView";

export default function OperationsList() {
  const operations = useSelector(getOperations);

  return (
    <List className="OperationsList" dense>
      {operations.map((operation) => (
        <OperationContainer key={operation.id} id={operation.id}>
          <OperationListItemView />
        </OperationContainer>
      ))}
    </List>
  );
}
