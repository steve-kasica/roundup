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
import { EnhancedOperationBlock } from "../OperationBlock";
import {
  withPackOperationData,
  withOperationData,
  withAssociatedAlerts,
} from "../../HOC";
import StyledBlock from "../../ui/StyledBlock";
import { ColumnTick } from "../ColumnTick";

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
  // Props passed directly from parent
  parentColumnCount,
  sx = {},
}) {
  console.log("Rendering PackOperationBlock with props:", {
    parentColumnCount,
    columnCount,
  });
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
            ((index === 0 ? leftColumnCount : rightColumnCount) /
              (parentColumnCount || columnCount)) *
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
      {/* Render a transparent block to take up remaining space if child columns don't sum to parent */}
      {parentColumnCount > columnCount && (
        <div
          className="difference"
          data-columncount={parentColumnCount - columnCount}
          style={{
            width:
              ((parentColumnCount - columnCount) / parentColumnCount) * 100 +
              "%",
            minHeight: "1px", // Ensure it's visible for testing
          }}
        >
          {Array.from({ length: parentColumnCount - columnCount }).map(
            (_, i) => (
              <ColumnTick
                key={i}
                isHovered={false}
                isDraggable={false}
                isDropTarget={false}
                isSelected={false}
                isOver={false}
                isLoading={false}
                isFocused={false}
                isNull={true} // Show as null to indicate missing columns
                isVisible={true}
                operationIndex={0} // Not used for difference ticks
                sx={{
                  // width: `${100 / (parentColumnCount - columnCount)}%`,
                  height: "100%",
                  backgroundColor: (theme) => theme.palette.grey[300],
                  // border: "1px dashed red", // Visualize the difference area
                }}
              />
            ),
          )}
        </div>
      )}
    </StyledBlock>
  );
}

const EnhancedPackOperationBlock = withOperationData(
  withAssociatedAlerts(withPackOperationData(PackOperationBlock)),
);

export { PackOperationBlock, EnhancedPackOperationBlock };
