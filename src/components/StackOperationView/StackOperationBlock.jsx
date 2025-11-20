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
import {
  isOperationId,
  OPERATION_TYPE_STACK,
} from "../../slices/operationsSlice";
import { Box, styled } from "@mui/material";
import { EnhancedTableBlock, TableBlock } from "../TableView/TableBlock";
import { EnhancedOperationBlock } from "../OperationView/OperationBlock.jsx";
import React from "react";
import StyledBlock from "../ui/StyledBlock.js";

// TODO: when addressing this layout, consider using
// styled components, but module SCSS will overwrite

function StackOperationBlock({
  // Props defined in `withOperationData` HOC
  id,
  isFocused,
  isRootOperation,
  activeColumnIds,
  // props via withStackOperationData
  childIds,
  columnCount,
  // Props defined in `withAssociatedAlerts` HOC
  hasAlerts = false,

  // Props defined in `OperationBlock` parent component
  backgroundColor,

  // Optional props passed recursively via parent operation
  // eslint-disable-next-line no-unused-vars
  parentColumnCount,
  sx = {},
}) {
  const isParentRender = isFocused || isRootOperation;
  console.log("StackOperationBlock", { backgroundColor });
  return (
    <StyledBlock
      data-operation-type="stack"
      hasError={hasAlerts}
      isFocused={isFocused}
      sx={{
        ...sx,
        flexDirection: "column",
      }}
    >
      {isParentRender ? (
        childIds.map((id, index, array) => {
          const childSx = {
            height: `${(1 / childIds.length) * 100}%`,
            ...(index < array.length - 1 && {
              marginBottom: "2px",
            }),
          };
          return (
            <React.Fragment key={id}>
              {isOperationId(id) ? (
                <EnhancedOperationBlock
                  id={id}
                  parentOperationType={OPERATION_TYPE_STACK}
                  parentColumnCount={columnCount}
                  backgroundColor={backgroundColor}
                  sx={childSx}
                />
              ) : (
                <EnhancedTableBlock
                  id={id}
                  parentOperationType={OPERATION_TYPE_STACK}
                  parentColumnCount={columnCount}
                  backgroundColor={backgroundColor}
                  sx={childSx}
                />
              )}
            </React.Fragment>
          );
        })
      ) : (
        <TableBlock
          hasAlerts={hasAlerts}
          id={id}
          activeColumnIds={activeColumnIds}
          activeColumnsCount={activeColumnIds.length} // TODO: is this already in HOC?
          parentOperationType={OPERATION_TYPE_STACK}
          parentColumnCount={columnCount}
          sx={{ width: "100%", height: "100%", border: "none" }}
        />
      )}
    </StyledBlock>
  );
}

StackOperationBlock.displayName = "Stack Operation Block";

const EnhancedStackOperationBlock = withStackOperationData(StackOperationBlock);

EnhancedStackOperationBlock.displayName = "Enhanced Stack Operation Block";

export { StackOperationBlock, EnhancedStackOperationBlock };
