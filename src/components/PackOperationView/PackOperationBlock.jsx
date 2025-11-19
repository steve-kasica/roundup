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
import { Box, styled } from "@mui/material";
import { EnhancedOperationBlock } from "../OperationView/OperationBlock";
import withPackOperationData from "./withPackOperationData";

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
  return (
    <StyledBox className="pack-operation-block" hasError={hasAlerts} sx={sx}>
      {childIds.map((childId, index, array) => {
        const childSx = {
          width:
            ((index === 0 ? leftColumnCount : rightColumnCount) / columnCount) *
              100 +
            "%",
          ...(index === array.length - 1 && {
            borderLeft: "none",
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
      })}
    </StyledBox>
  );
}

const EnhancedPackOperationBlock = withPackOperationData(PackOperationBlock);

export { PackOperationBlock, EnhancedPackOperationBlock };
