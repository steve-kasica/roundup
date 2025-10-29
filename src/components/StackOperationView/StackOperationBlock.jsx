/* eslint-disable react/prop-types */
/**
 * CompositeTableSchema/Operation.jsx
 * -----------------------------------------------------------------
 * A visual representation of an operation in the **Output Schema**
 * It is a container for **Source Tables** and/or other **Operations**.
 * When an **Operation** is present in `node.children`, it recursively
 * calls itself. Only **SourceTables** can be leaves in the
 * **Table Tree**, by design.
 */

import withStackOperationData from "./withStackOperationData.jsx";
import {
  isOperationId,
  OPERATION_TYPE_PACK,
  OPERATION_TYPE_STACK,
} from "../../slices/operationsSlice";
import { Box, Tooltip, styled } from "@mui/material";
import { EnhancedPackOperationBlock } from "../PackOperationView/PackOperationBlock.jsx";
import { EnhancedTableBlock } from "../TableView/TableBlock";

// TODO: when addressing this layout, consider using
// styled components, but module SCSS will overwrite
const StyledBox = styled(Box, {
  shouldForwardProp: (prop) =>
    ["isError", "isFocused"].includes(prop) === false,
})(({ theme, isError, isFocused }) => ({
  ...(isError && {
    backgroundColor: theme.palette.error.main,
    borderLeft: `4px solid ${theme.palette.error.dark}`,
  }),
  ...(isFocused && {
    boxShadow: `0 0 0 2px ${theme.palette.primary.main}`,
  }),
}));

function StackOperationBlock({
  // props via withStackOperationData
  operation,
  childObjects, // [{id, objectType}]
  columnCount,
  depth,
  isFocused,
  isHovered,
  alerts = [],
  hasAlerts = false,
  isError = false,

  // Props passed recusrively via parent operation
  parentColumnCount = 0,
}) {
  // Parse error message if it's a JSON string
  const getErrorMessage = () => {
    if (!hasAlerts) return "";

    return alerts.map((alert) => alert.message).join("\n");
  };

  const operationContent = (
    <StyledBox
      isError={hasAlerts}
      isFocused={isFocused}
      sx={{
        flexBasis: `${(columnCount / parentColumnCount) * 100}%`,
      }}
    >
      {childObjects.map(({ id, operationType }) =>
        isOperationId(id) && operationType === OPERATION_TYPE_STACK ? (
          <EnhancedStackOperationBlock
            key={id}
            id={id}
            parentColumnCount={columnCount}
          />
        ) : isOperationId(id) && operationType === OPERATION_TYPE_PACK ? (
          <EnhancedPackOperationBlock
            key={id}
            id={id}
            parentColumnCount={columnCount}
          />
        ) : (
          <EnhancedTableBlock
            key={id}
            id={id}
            isDraggable={false}
            parentOperationType={operation.operationType}
            parentColumnCount={columnCount}
          />
        )
      )}
    </StyledBox>
  );

  return operation.error ? (
    <Tooltip title={getErrorMessage()} arrow placement="top">
      {operationContent}
    </Tooltip>
  ) : (
    operationContent
  );
}

StackOperationBlock.displayName = "StackOperationBlock";

const EnhancedStackOperationBlock = withStackOperationData(StackOperationBlock);

EnhancedStackOperationBlock.displayName = "EnhancedStackOperationBlock";

export { StackOperationBlock, EnhancedStackOperationBlock };
