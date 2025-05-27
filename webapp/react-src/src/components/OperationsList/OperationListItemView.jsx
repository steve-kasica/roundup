import { ListItemButton, ListItemText } from "@mui/material";
import { setFocusedOperation } from "../../data/slices/operationsSlice";
import { useDispatch } from "react-redux";
import withOperationData from "../HOC/withOperationData";

export const LAYOUT_ID = "operationListItem";

function OperationListItemView({
  id,
  operationType,
  tableIds,
  columnCount,

  index,
}) {
  const dispatch = useDispatch();

  const label = operationType.charAt(0).toUpperCase() + operationType.slice(1);
  const position = index + 1;

  return (
    <ListItemButton onClick={() => dispatch(setFocusedOperation({ id }))}>
      <ListItemText
        primary={`${position}. ${label} (${columnCount})`}
        secondary={tableIds.join(", ")}
      />
    </ListItemButton>
  );
}

const EnhancedOperationListItemView = withOperationData(OperationListItemView);
export default EnhancedOperationListItemView;
