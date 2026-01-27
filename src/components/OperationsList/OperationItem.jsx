import {
  ListItemIcon,
  ListItemText,
  MenuItem,
  Typography,
} from "@mui/material";
import { withOperationData } from "../HOC";
import {
  OPERATION_TYPE_PACK,
  OPERATION_TYPE_STACK,
} from "../../slices/operationsSlice";
import { PackOperationIcon, StackOperationIcon } from "../ui/icons";
import { IntegerNumber } from "../ui/text";

const OperationItem = ({ id, name, operationType, columnCount, rowCount }) => {
  const displayName = name || `Operation ${id}`;
  return (
    <MenuItem value={id}>
      <ListItemIcon>
        {operationType === OPERATION_TYPE_STACK ? (
          <StackOperationIcon />
        ) : operationType === OPERATION_TYPE_PACK ? (
          <PackOperationIcon />
        ) : null}
      </ListItemIcon>
      <ListItemText>
        {displayName}
        {columnCount !== undefined && rowCount !== undefined && (
          <Typography component="small">
            <IntegerNumber value={columnCount} /> x{" "}
            <IntegerNumber value={rowCount} />
          </Typography>
        )}
      </ListItemText>
    </MenuItem>
  );
};

const EnhancedOperationItem = withOperationData(OperationItem);

export { OperationItem, EnhancedOperationItem };
