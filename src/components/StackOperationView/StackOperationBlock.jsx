/* eslint-disable react/prop-types */
/**
 * CompositeTableSchema/Operation.jsx
 * -----------------------------------------------------------------
 * A visual representation of an operation in the **Output Schema**
 * It is a container for **Source Tables** and/or other **Operations**.
 * When an **Operation** is present in `node.childIds`, it recursively
 * calls itself. Only **SourceTables** can be leaves in the
 * **Table Tree**, by design.
 */

import withStackOperationData from "./withStackOperationData.jsx";
import { isOperationId } from "../../slices/operationsSlice";
import { Box, styled } from "@mui/material";
import { EnhancedTableBlock } from "../TableView/TableBlock";
import { EnhancedOperationBlock } from "../OperationView/OperationBlock.jsx";
import React from "react";

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
  childIds,
  operationType,
  columnCount,
  isFocused,
  hasAlerts = false,

  // Optional props passed recursively via parent operation
  parentColumnCount = 0,
}) {
  console.log("Rendering StackOperationBlock for operation:", childIds);
  return (
    <StyledBox
      isError={hasAlerts}
      isFocused={isFocused}
      sx={{
        flexBasis: `${(columnCount / parentColumnCount) * 100}%`,
      }}
    >
      {/* Render child operations and tables */}
      {childIds.map((id, index) => {
        const isFirst = index === 0;
        const childSx = !isFirst ? { borderTop: "none" } : {};
        return (
          <React.Fragment key={id}>
            {isOperationId(id) ? (
              <EnhancedOperationBlock
                id={id}
                parentOperationType={operationType}
                parentColumnCount={columnCount}
                sx={childSx}
              />
            ) : (
              <EnhancedTableBlock
                id={id}
                parentOperationType={operationType}
                parentColumnCount={columnCount}
                sx={childSx}
              />
            )}
          </React.Fragment>
        );
      })}
    </StyledBox>
  );
}

StackOperationBlock.displayName = "Stack Operation Block";

const EnhancedStackOperationBlock = withStackOperationData(StackOperationBlock);

EnhancedStackOperationBlock.displayName = "EnhancedStackOperationBlock";

export { StackOperationBlock, EnhancedStackOperationBlock };
