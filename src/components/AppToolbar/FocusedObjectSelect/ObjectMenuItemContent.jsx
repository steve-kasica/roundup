import { Stack, Typography } from "@mui/material";
import { withOperationData, withTableData } from "../../HOC";
import { IntegerNumber } from "../../ui/text";
import { PackOperationIcon, StackOperationIcon } from "../../ui/icons";
import { TableIcon } from "lucide-react";
import {
  OPERATION_TYPE_PACK,
  OPERATION_TYPE_STACK,
} from "../../../slices/operationsSlice";

// Content component without MenuItem wrapper
const ObjectMenuItemContent = ({
  name,
  id,
  rowCount,
  columnCount,
  operationType,
}) => (
  <Stack direction="row" alignItems="center" spacing={1}>
    {operationType === OPERATION_TYPE_STACK ? (
      <StackOperationIcon />
    ) : operationType === OPERATION_TYPE_PACK ? (
      <PackOperationIcon />
    ) : (
      <TableIcon />
    )}
    <Typography variant="data-secondary">
      {name || id}&nbsp;
      <small>
        <IntegerNumber value={columnCount} /> x{" "}
        <IntegerNumber value={rowCount} />
      </small>
    </Typography>
  </Stack>
);

const EnhancedTableMenuItemContent = withTableData(ObjectMenuItemContent);

const EnhancedOperationMenuItemContent = withOperationData(
  ObjectMenuItemContent
);

export { EnhancedTableMenuItemContent, EnhancedOperationMenuItemContent };
