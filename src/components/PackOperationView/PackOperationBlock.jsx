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
 * @module components/PackOperationView/PackOperationBlock
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

import { EnhancedTableBlock } from "../TableView";
import { OPERATION_TYPE_PACK } from "../../slices/operationsSlice";
import { isTableId } from "../../slices/tablesSlice";
import { Typography } from "@mui/material";
import { EnhancedOperationBlock } from "../OperationView/OperationBlock";
import {
  withPackOperationData,
  withOperationData,
  withAssociatedAlerts,
} from "../HOC";
import StyledBlock from "../ui/StyledBlock";

function PackOperationBlock({
  // props via withOperationData
  childIds,
  id,
  name,
  depth,
  isFocused,
  isRootOperation,
  rowCount,
  // Props via withPackOperationData
  leftColumnCount,
  rightColumnCount,
  columnCount,
  // Props via withAssociatedAlerts HOC
  totalCount,
  // Props passed via parent
  parentColumnCount,
  colorScale,
  sx = {},
}) {
  const isParentRender = isFocused || isRootOperation;
  const rowCountDisplay = rowCount?.toLocaleString() || "???";
  const columnCountDisplay = columnCount?.toLocaleString() || "???";

  return (
    <StyledBlock
      className="PackOperationBlock"
      isFocused={isFocused}
      hasError={totalCount}
      sx={{
        alignItems: "stretch",
        backgroundColor: colorScale(depth),
        ...sx,
      }}
    >
      {/* TODO: move these styles into a shared variant in theme */}
      <Typography
        variant="data-small"
        sx={{
          wordWrap: "none",
        }}
      >
        {totalCount > 0 ? `⚠` : ""} {name || id}{" "}
        <small style={{ color: "#555" }}>
          {columnCountDisplay.toLocaleString()} x{" "}
          {rowCountDisplay.toLocaleString()}
        </small>
      </Typography>
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
              backgroundColor={colorScale(depth + 1)}
              sx={childSx}
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
  withAssociatedAlerts(withPackOperationData(PackOperationBlock))
);

export { PackOperationBlock, EnhancedPackOperationBlock };
