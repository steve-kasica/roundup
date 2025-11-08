/* eslint-disable react/prop-types */
/**
 * CompositeTableSchema/Operation.jsx
 * -----------------------------------------------------------------
 * A visual representation of an operation in the **Output Schema**
 * It is a container for **Source Tables** and/or other **Operations**.
 * When an **Operation** is present in `node.children`, it recursively
 * calls itself. Only **SourceTables** can be leaves in the
 * **Table Tree**, by design.
 */

import { EnhancedTableBlock } from "../TableView";
import withOperationData from "../HOC/withOperationData";
import {
  isOperationId,
  OPERATION_TYPE_PACK,
} from "../../slices/operationsSlice";
import { isTableId } from "../../slices/tablesSlice";
import { Box, Tooltip, styled } from "@mui/material";

// TODO: when addressing this layout, consider using
// styled components, but module SCSS will overwrite
const StyledBox = styled(Box, {
  shouldForwardProp: (prop) => prop !== "hasError",
})(({ theme, hasError }) => ({
  display: "flex",
  flexDirection: "row",
  borderWidth: "4px",
  borderStyle: "solid",
  borderColor: theme.palette.divider,
  ...(hasError && {
    borderColor: theme.palette.error.dark,
  }),
}));

function PackOperationBlock({
  // props via withOperationData
  childIds,
  columnCount,
  // Props via withAssociatedAlerts HOC
  hasAlerts,
  // Props passed via parent
  parentColumnCount = 0,
}) {
  const childOperationIds = childIds.filter(isOperationId);
  const childTableIds = childIds.filter(isTableId);

  return (
    <StyledBox className="pack-operation-block" hasError={hasAlerts}>
      {childOperationIds.length > 0
        ? childOperationIds.map(
            (childOperationId) => null
            // <EnhancedOperationView
            //   key={childOperationId}
            //   id={childOperationId}
            //   parentColumnCount={columnCount}
            // />
          )
        : null}
      {childTableIds.length > 0
        ? childTableIds.map((tableId, index) => (
            <EnhancedTableBlock
              key={tableId}
              id={tableId}
              isDraggable={false}
              parentOperationType={OPERATION_TYPE_PACK}
              parentColumnCount={columnCount}
              sx={{
                ...(index === childTableIds.length - 1 && {
                  borderLeft: "none",
                }),
              }}
            />
          ))
        : null}
    </StyledBox>
  );
}

const EnhancedPackOperationBlock = withOperationData(PackOperationBlock);

export { PackOperationBlock, EnhancedPackOperationBlock };
