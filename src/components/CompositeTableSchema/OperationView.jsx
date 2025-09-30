/**
 * CompositeTableSchema/Operation.jsx
 * -----------------------------------------------------------------
 * A visual representation of an operation in the **Output Schema**
 * It is a container for **Source Tables** and/or other **Operations**.
 * When an **Operation** is present in `node.children`, it recursively
 * calls itself. Only **SourceTables** can be leaves in the
 * **Table Tree**, by design.
 */

import { EnhancedTableBlock } from "../TableView";
import withOperationData from "../HOC/withOperationData";
import { isOperationId } from "../../slices/operationsSlice";
import { isTableId } from "../../slices/tablesSlice";
import PropTypes from "prop-types";
import { Box, Tooltip, styled } from "@mui/material";

// TODO: when addressing this layout, consider using
// styled components, but module SCSS will overwrite
const StyledBox = styled(Box, {
  shouldForwardProp: (prop) => prop !== "hasError",
})(({ theme, hasError }) => ({
  ...(hasError && {
    backgroundColor: theme.palette.error.main,
    borderLeft: `4px solid ${theme.palette.error.dark}`,
  }),
}));

function OperationView({
  // props via withOperationData
  operation,
  columnCount,
  depth,
  isFocused,
  isHovered,
  childrenIds,

  // Props passed recusrively via parent operation
  parentColumnCount = 0,
}) {
  const childOperationIds = childrenIds.filter(isOperationId);
  const childTableIds = childrenIds.filter(isTableId);

  const className = [
    "operation",
    operation.operationType || "no-op",
    `depth-${depth}`,
    isFocused ? "focused" : "",
    isHovered ? "hover" : "",
    operation.error ? "error" : "",
  ].filter(Boolean);

  // Parse error message if it's a JSON string
  const getErrorMessage = () => {
    if (!operation.error) return "";

    if (typeof operation.error === "string") {
      try {
        const parsedError = JSON.parse(operation.error);
        return parsedError.message || operation.error;
      } catch {
        return operation.error;
      }
    }

    return operation.error.message || "An error occurred";
  };

  const operationContent = (
    <StyledBox
      hasError={Boolean(operation.error)}
      className={className.join(" ")}
      sx={{
        flexBasis: `${(columnCount / parentColumnCount) * 100}%`,
      }}
    >
      {childOperationIds.length > 0
        ? childOperationIds.map((childOperationId) => (
            <EnhancedOperationView
              key={childOperationId}
              id={childOperationId}
              parentColumnCount={columnCount}
            />
          ))
        : null}
      {childTableIds.length > 0
        ? childTableIds.map((tableId) => (
            <EnhancedTableBlock
              key={tableId}
              id={tableId}
              isDraggable={false}
              parentOperationType={operation.operationType}
              parentColumnCount={columnCount}
            />
          ))
        : null}
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

OperationView.propTypes = {
  // Props via withOperationData HOC
  operation: PropTypes.shape({
    operationType: PropTypes.string,
    error: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.string,
      PropTypes.bool,
    ]),
  }).isRequired,
  depth: PropTypes.number,
  columnCount: PropTypes.number.isRequired,
  isFocused: PropTypes.bool,
  isHovered: PropTypes.bool,
  childrenIds: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  ).isRequired,

  // Props passed recursively via parent operation
  parentColumnCount: PropTypes.number,
};

const EnhancedOperationView = withOperationData(OperationView);

export default EnhancedOperationView;
