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
import { Box, styled } from "@mui/material";
import { EnhancedOperationBlock } from "../OperationView/OperationBlock";
import withPackOperationData from "./withPackOperationData";
import StyledBlock from "../ui/StyledBlock";

function PackOperationBlock({
  // props via withOperationData
  childIds,
  id,
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
  sx = {},
}) {
  const isParentRender = isFocused || isRootOperation;

  return (
    <StyledBlock className="pack-operation-block" hasError={hasAlerts} sx={sx}>
      {isParentRender ? (
        childIds.map((childId, index, array) => {
          const childSx = {
            width:
              ((index === 0 ? leftColumnCount : rightColumnCount) /
                columnCount) *
                100 +
              "%",
            ...(index === array.length - 1 && {
              borderLeft: "2px solid " + "#000",
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
        })
      ) : (
        <TableBlock
          hasAlerts={hasAlerts}
          id={id}
          activeColumnIds={activeColumnIds}
          activeColumnsCount={activeColumnIds.length} // TODO: is this already in HOC?
          columnCount={columnCount}
          rowCount={rowCount}
          parentOperationType={OPERATION_TYPE_PACK}
          parentColumnCount={columnCount}
          sx={{ width: "100%", height: "100%", border: "none" }}
        />
      )}
    </StyledBlock>
  );
}

const EnhancedPackOperationBlock = withPackOperationData(PackOperationBlock);

export { PackOperationBlock, EnhancedPackOperationBlock };
