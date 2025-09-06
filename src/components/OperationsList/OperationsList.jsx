import { useSelector } from "react-redux";
import { selectAllOperationIds } from "../../slices/operationsSlice";
import OperationView from "./OperationView";

import "./OperationsList.scss";
import { Box } from "@mui/material";

export default function OperationsList() {
  const operationIds = useSelector(selectAllOperationIds);

  return (
    <Box>
      {operationIds
        .slice()
        .reverse()
        .map((operationId, i) => (
          <OperationView key={operationId} id={operationId} index={i} />
        ))}
    </Box>
  );
}
