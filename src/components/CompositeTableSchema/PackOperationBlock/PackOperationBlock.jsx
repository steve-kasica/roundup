/**
 * @fileoverview PackOperationBlock Component
 *
 * Renders a PACK (join) operation block in the hierarchical schema tree visualization.
 * Shows the operation label and recursively renders child tables/operations with
 * proportional widths based on their column counts.
 *
 * PACK operations combine tables horizontally (joining), and this visualization
 * reflects that by placing children side-by-side with widths proportional to their
 * contribution to the final column count.
 *
 * @module components/CompositeTableSchema/PackOperationBlock
 *
 * @example
 * <EnhancedPackOperationBlock
 *   id="pack-operation-123"
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

import { EnhancedTableBlock } from "../TableBlock";
import { OPERATION_TYPE_PACK } from "../../../slices/operationsSlice";
import { isTableId } from "../../../slices/tablesSlice";
import { Box } from "@mui/material";
import { EnhancedOperationBlock } from "../OperationBlock";
import {
  withPackOperationData,
  withOperationData,
  withAssociatedAlerts,
} from "../../HOC";
import StyledBlock from "../../ui/StyledBlock";

function PackOperationBlock({
  // props via withOperationData
  childIds,
  depth,
  isFocused,
  isDarkBackground,
  // Props via withPackOperationData
  leftColumnCount,
  rightColumnCount,
  columnCount,
  // Props via withAssociatedAlerts HOC
  totalCount,
  sx = {},
}) {
  const useLightText = isDarkBackground(depth);
  const useLightTextInChildren = isDarkBackground(depth + 1);

  return (
    <StyledBlock
      className="PackOperationBlock"
      isFocused={isFocused}
      hasError={totalCount}
      sx={{
        display: "flex",
        flexDirection: "row",
        boxSizing: "border-box",
        flexGrow: 1,
        color: (theme) =>
          useLightText ? theme.palette.textLight : theme.palette.textDark,
        ...sx,
      }}
    >
      {childIds.map((childId, index) => {
        const childSx = {
          width:
            ((index === 0 ? leftColumnCount : rightColumnCount) / columnCount) *
              100 +
            "%",
          marginLeft: index === 0 ? "0px" : "2px",
        };
        if (isTableId(childId)) {
          return (
            <EnhancedTableBlock
              key={childId}
              id={childId}
              isDraggable={false}
              parentOperationType={OPERATION_TYPE_PACK}
              parentColumnCount={columnCount}
              sx={{
                ...childSx,
                color: (theme) =>
                  useLightTextInChildren
                    ? theme.palette.textLight
                    : theme.palette.textDark,
              }}
            />
          );
        } else {
          return (
            <EnhancedOperationBlock
              id={childId}
              key={childId}
              parentOperationType={OPERATION_TYPE_PACK}
              parentColumnCount={columnCount}
              sx={childSx}
            />
          );
        }
      })}
    </StyledBlock>
  );
}

const EnhancedPackOperationBlock = withOperationData(
  withAssociatedAlerts(withPackOperationData(PackOperationBlock)),
);

export { PackOperationBlock, EnhancedPackOperationBlock };
