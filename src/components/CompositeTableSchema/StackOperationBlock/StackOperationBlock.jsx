/**
 * @fileoverview StackOperationBlock Component
 *
 * Renders a STACK (union) operation block in the hierarchical schema tree visualization.
 * Shows the operation label and recursively renders child tables/operations stacked
 * vertically with heights proportional to their row counts.
 *
 * STACK operations combine tables vertically (union/concatenate), and this visualization
 * reflects that by stacking children vertically with heights based on their row contributions.
 *
 * @module components/CompsiteTableSchema/StackOperationBlock
 *
 * @example
 * <EnhancedStackOperationBlock
 *   id="stack-operation-123"
 *   depth={1}
 *   colorScale={d3ScaleFunction}
 * />
 */

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

import {
  withAssociatedAlerts,
  withOperationData,
  withStackOperationData,
} from "../../HOC";
import {
  isOperationId,
  OPERATION_TYPE_STACK,
} from "../../../slices/operationsSlice/index.js";
import { Box } from "@mui/material";
import { EnhancedTableBlock } from "../TableBlock/index.js";
import { EnhancedOperationBlock } from "../OperationBlock.jsx";
import React from "react";
import StyledBlock from "../../ui/StyledBlock.js";
import { BLOCK_BREAKPOINTS } from "../settings.js";

function StackOperationBlock({
  // Props defined in `withOperationData` HOC
  isFocused,
  rowCount,
  depth,
  focusedDepth,
  focusOperation,
  childRowCounts,
  // props via withStackOperationData
  childIds,
  columnCount,
  // Props defined in `withAssociatedAlerts` HOC
  totalCount,

  // Props defined in `OperationBlock` parent component
  isDarkBackground,

  // Optional props passed recursively via parent operation
  // eslint-disable-next-line no-unused-vars
  parentColumnCount,
  parentRowCount,
  sx = {},
}) {
  // TODO: I think we can compute this via sx and using child row counts from operation via the parent
  // const height = parentRowCount ? (rowCount / parentRowCount) * 100 : 100; // height as percentage of parent operation's row count
  const useLightText = isDarkBackground(depth);
  const useLightTextInChildren = isDarkBackground(depth + 1);
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
        containerType: "size",
        color: (theme) =>
          useLightText ? theme.palette.textLight : theme.palette.textDark,
        cursor: focusedDepth > 0 ? "pointer" : "default",
        height: `100%`, // Set to 100%, actual height controlled by parent via sx
        ...sx,
      }}
    >
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 0.25,
          width: "100%",
          transition: "opacity 0.3s ease",
          [`@container (max-height: ${BLOCK_BREAKPOINTS.HEIGHT.MEDIUM}px)`]: {
            opacity: 0,
          },
        }}
      >
        {childIds.map((id) => {
          const childSx = {
            height: `${(childRowCounts.get(id) / rowCount) * 100}%`,
          };
          return (
            <React.Fragment key={id}>
              {isOperationId(id) ? (
                <EnhancedOperationBlock
                  id={id}
                  parentOperationType={OPERATION_TYPE_STACK}
                  parentColumnCount={columnCount}
                  parentRowCount={rowCount}
                  sx={childSx}
                />
              ) : (
                <EnhancedTableBlock
                  id={id}
                  parentOperationType={OPERATION_TYPE_STACK}
                  parentColumnCount={columnCount}
                  sx={{
                    ...childSx,
                    borderBottom: "1px solid #fff",
                    color: (theme) =>
                      useLightTextInChildren
                        ? theme.palette.textLight
                        : theme.palette.textDark,
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </Box>
    </StyledBlock>
  );
}

StackOperationBlock.displayName = "Stack Operation Block";

const EnhancedStackOperationBlock = withOperationData(
  withStackOperationData(withAssociatedAlerts(StackOperationBlock))
);

EnhancedStackOperationBlock.displayName = "Enhanced Stack Operation Block";

export { StackOperationBlock, EnhancedStackOperationBlock };
