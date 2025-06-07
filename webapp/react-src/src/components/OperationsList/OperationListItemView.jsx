import { ListItemButton, ListItemText } from "@mui/material";
import { setFocusedOperation } from "../../data/slices/operationsSlice";
import { useDispatch } from "react-redux";
import withOperationData from "../HOC/withOperationData";
import PropTypes from "prop-types";

export const LAYOUT_ID = "operationListItem";

function OperationListItemView({
  id,
  operationType,
  childrenIds,
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
        secondary={childrenIds.join(", ")}
      />
    </ListItemButton>
  );
}

OperationListItemView.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  operationType: PropTypes.string.isRequired,
  childrenIds: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  ).isRequired,
  columnCount: PropTypes.number.isRequired,
  index: PropTypes.number.isRequired,
};

const EnhancedOperationListItemView = withOperationData(OperationListItemView);
export default EnhancedOperationListItemView;
