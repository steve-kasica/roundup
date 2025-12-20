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
import { Typography } from "@mui/material";
import { EnhancedTableBlock } from "../TableView/TableBlock";
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
  name,
  rowCount,
  depth,
  focusedDepth,
  focusOperation,
  // props via withStackOperationData
  childIds,
  columnCount,
  // Props defined in `withAssociatedAlerts` HOC
  totalCount,

  // Props defined in `OperationBlock` parent component
  colorScale,

  // Optional props passed recursively via parent operation
  // eslint-disable-next-line no-unused-vars
  parentColumnCount,
  sx = {},
}) {
  const isParentRender = isFocused || isRootOperation;
  return (
    <StyledBlock
      className="StackOperationBlock"
      hasError={totalCount}
      isFocused={isFocused}
      onClick={(event) => {
        event.stopPropagation();
        focusOperation();
      }}
      sx={{
        flexDirection: "column",
        boxSizing: "border-box",
        backgroundColor: colorScale(depth),
        cursor: focusedDepth > 0 ? "pointer" : "default",
        ...sx,
      }}
    >
      <Typography variant="treemap label">
        {totalCount > 0 ? `⚠` : ""} {name || id} <br></br>
        <small style={{ color: "#555" }}>
          {columnCount.toLocaleString()} x {rowCount.toLocaleString()}
        </small>
      </Typography>
      {focusedDepth < 1
        ? childIds.map((id, index, array) => {
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
                    sx={childSx}
                  />
                ) : (
                  <EnhancedTableBlock
                    id={id}
                    parentOperationType={OPERATION_TYPE_STACK}
                    parentColumnCount={columnCount}
                    backgroundColor={colorScale(depth + 1)}
                    sx={childSx}
                  />
                )}
              </React.Fragment>
            );
          })
        : null}
    </StyledBlock>
  );
}

StackOperationBlock.displayName = "Stack Operation Block";

const EnhancedStackOperationBlock = withStackOperationData(StackOperationBlock);

EnhancedStackOperationBlock.displayName = "Enhanced Stack Operation Block";

export { StackOperationBlock, EnhancedStackOperationBlock };
