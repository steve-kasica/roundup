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

import { EnhancedTableBlock, TableBlock } from "../TableView";
import { OPERATION_TYPE_PACK } from "../../slices/operationsSlice";
import { isTableId } from "../../slices/tablesSlice";
import { Box, styled, Typography } from "@mui/material";
import { EnhancedOperationBlock } from "../OperationView/OperationBlock";
import withPackOperationData from "./withPackOperationData";
import StyledBlock from "../ui/StyledBlock";

function PackOperationBlock({
  // props via withOperationData
  childIds,
  id,
  name,
  depth,
  activeColumnIds,
  isFocused,
  isRootOperation,
  rowCount,
  // Props via withPackOperationData
  leftColumnCount,
  rightColumnCount,
  columnCount,
  // Props via withAssociatedAlerts HOC
  hasAlerts,
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
      className="pack-operation-block"
      isFocused={isFocused}
      hasError={hasAlerts}
      sx={{
        paddingTop: "20px",
        paddingLeft: "2px",
        paddingRight: "2px",
        paddingBottom: "2px",
        boxSizing: "border-box",
        alignItems: "stretch",
        position: "relative",
        backgroundColor: colorScale(depth),
        ...sx,
      }}
    >
      <Typography variant="treemap label">
        {hasAlerts && `⚠`} {name || id}{" "}
        <small style={{ color: "#555" }}>
          {columnCountDisplay} x {rowCountDisplay}
        </small>
      </Typography>
      {childIds.map((childId, index, array) => {
        const childSx = {
          width:
            ((index === 0 ? leftColumnCount : rightColumnCount) / columnCount) *
              100 +
            "%",
          ...(index === array.length - 1 && {
            paddingLeft: "1px",
          }),
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

const EnhancedPackOperationBlock = withPackOperationData(PackOperationBlock);

export { PackOperationBlock, EnhancedPackOperationBlock };
