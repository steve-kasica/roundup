/* eslint-disable react/prop-types */

import { ColumnTick, EnhancedColumnTick } from "../ColumnViews";
import { OPERATION_TYPE_STACK } from "../../slices/operationsSlice/Operation.js";
import withTableData from "./withTableData.jsx";
import { Box, Typography } from "@mui/material";

function TableBlock({
  // props via withTableData
  table,
  columnCount,
  activeColumnIds,
  // TODO are these still being used?
  // isDragging,
  // isPressed,
  // isFocused,

  // props passed via OperationBlockView
  parentOperationType,
  parentColumnCount,
}) {
  const ticks = Array.from(
    {
      length:
        parentOperationType === OPERATION_TYPE_STACK
          ? parentColumnCount
          : columnCount,
    },
    (_, i) => (i < columnCount ? activeColumnIds[i] : null)
  );

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "row",
        alignItems: "stretch",
        flexBasis: `${(columnCount / parentColumnCount) * 100}%`,
        position: "relative",
      }}
    >
      <Typography
        variant="caption"
        className="table-id"
        sx={{
          position: "absolute",
          top: 4,
          left: 4,
          zIndex: 10,
          padding: "2px 6px",
          borderRadius: "4px",
          fontSize: "0.7rem",
          pointerEvents: "none",
          backdropFilter: "blur(2px)",
        }}
      >
        {table.name || table.id}
      </Typography>
      {ticks.map((columnId, index) =>
        columnId === null ? (
          <ColumnTick key={`empty-${index}`} id={null} />
        ) : (
          <EnhancedColumnTick
            key={`${columnId}-${index}`} // Ensure unique key even when columnId is null
            id={columnId}
          />
        )
      )}
    </Box>
  );
}

TableBlock.displayName = "TableBlock";

const EnhancedTableBlock = withTableData(TableBlock);

EnhancedTableBlock.displayName = "EnhancedTableBlock";

export { TableBlock, EnhancedTableBlock };
