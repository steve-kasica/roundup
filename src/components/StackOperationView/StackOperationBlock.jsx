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
import { Box, Tooltip, Typography, styled } from "@mui/material";
import { EnhancedPackOperationBlock } from "../PackOperationView/PackOperationBlock.jsx";
import { EnhancedTableBlock } from "../TableView/TableBlock";

// TODO: when addressing this layout, consider using
// styled components, but module SCSS will overwrite
const StyledBox = styled(Box, {
  shouldForwardProp: (prop) =>
    ["isError", "isFocused"].includes(prop) === false,
})(({ theme, isError, isFocused }) => ({
  borderWidth: "4px",
  borderStyle: "solid",
  borderColor: theme.palette.divider,
  ...(isError && {
    // backgroundColor: theme.palette.error.main,
    borderColor: theme.palette.error.dark,
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
      {/* Render child operations and tables */}
      {childObjects.map(({ id, operationType }, index) => {
        const isFirst = index === 0;
        const childSx = !isFirst ? { borderTop: "none" } : {};

        if (isOperationId(id) && operationType === OPERATION_TYPE_STACK) {
          return (
            <EnhancedStackOperationBlock
              key={id}
              id={id}
              parentColumnCount={columnCount}
              sx={childSx}
            />
          );
        } else if (isOperationId(id) && operationType === OPERATION_TYPE_PACK) {
          return (
            <EnhancedPackOperationBlock
              key={id}
              id={id}
              parentColumnCount={columnCount}
              sx={childSx}
            />
          );
        } else {
          return (
            <EnhancedTableBlock
              key={id}
              id={id}
              isDraggable={false}
              parentOperationType={operation.operationType}
              parentColumnCount={columnCount}
              sx={childSx}
            />
          );
        }
      })}
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
