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
import { Box, styled, Typography } from "@mui/material";
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
  name,
  rowCount,
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
  return (
    <StyledBlock
      data-operation-type="stack"
      hasError={hasAlerts}
      isFocused={isFocused}
      sx={{
        ...sx,
        flexDirection: "column",
        boxSizing: "border-box",
        alignItems: "stretch",
        position: "relative",
        paddingTop: "20px",
        paddingLeft: "2px",
        paddingRight: "2px",
        paddingBottom: "2px",
        backgroundColor: backgroundColor,
      }}
    >
      <Typography variant="treemap label">
        {hasAlerts && `⚠`} {name || id}{" "}
        <small style={{ color: "#555" }}>
          {columnCount.toLocaleString()} x {rowCount.toLocaleString()}
        </small>
      </Typography>
      {/* <Box height={"100%"} padding={2}> */}
      {childIds.map((id, index, array) => {
        const childSx = {
          height: `${(1 / childIds.length) * 100}%`,
          ...(index < array.length - 1 && {
            marginBottom: isParentRender ? "2px" : undefined,
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
      })}
      {/* </Box> */}
    </StyledBlock>
  );
}

StackOperationBlock.displayName = "Stack Operation Block";

const EnhancedStackOperationBlock = withStackOperationData(StackOperationBlock);

EnhancedStackOperationBlock.displayName = "Enhanced Stack Operation Block";

export { StackOperationBlock, EnhancedStackOperationBlock };
