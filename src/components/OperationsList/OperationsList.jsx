import { List } from "@mui/material";
import { useSelector } from "react-redux";
import { selectAllOperationIds } from "../../slices/operationsSlice";
import OperationView from "./OperationView";

import "./OperationsList.scss";

export default function OperationsList() {
  const operationIds = useSelector(selectAllOperationIds);

  return (
    <List className="OperationsList" dense>
      {operationIds
        .slice()
        .reverse()
        .map((operationId, i) => (
          <OperationView key={operationId} id={operationId} index={i} />
        ))}
    </List>
  );
}
