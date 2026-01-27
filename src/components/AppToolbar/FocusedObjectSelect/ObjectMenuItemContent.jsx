import { Stack, Typography } from "@mui/material";
import {
  withOperationData,
  withPackOperationData,
  withStackOperationData,
  withTableData,
} from "../../HOC";
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
        {isNaN(columnCount) ? "?" : <IntegerNumber value={columnCount} />}
        &nbsp;x&nbsp;
        {isNaN(rowCount) ? "?" : <IntegerNumber value={rowCount} />}
      </small>
    </Typography>
  </Stack>
);

const EnhancedTableMenuItemContent = withTableData(ObjectMenuItemContent);
const EnhancedPackMenuItemContent = withPackOperationData(
  ObjectMenuItemContent,
);
const EnhancedStackMenuItemContent = withStackOperationData(
  ObjectMenuItemContent,
);

const EnhancedOperationMenuItemContent = withOperationData(
  ({ operationType, id }) => {
    if (operationType === OPERATION_TYPE_STACK) {
      return <EnhancedStackMenuItemContent id={id} />;
    } else if (operationType === OPERATION_TYPE_PACK) {
      return <EnhancedPackMenuItemContent id={id} />;
    } else {
      return null;
    }
  },
);

export { EnhancedTableMenuItemContent, EnhancedOperationMenuItemContent };
