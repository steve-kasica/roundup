/* eslint-disable react/prop-types */

import { ColumnTick, EnhancedColumnTick } from "../ColumnViews";
import { OPERATION_TYPE_STACK } from "../../slices/operationsSlice/Operation.js";
import withTableData from "./withTableData.jsx";
import { Box, Typography } from "@mui/material";

function TableBlock({
  // Props from withAssociatedAlerts via withTableData
  id, // eslint-disable-line no-unused-vars
  alertIds,
  hasAlerts,
  // props via withTableData
  table,
  activeColumnIds,
  activeColumnsCount,

  // props passed via OperationBlockView
  parentOperationType,
  parentColumnCount,
}) {
  const ticks = Array.from(
    {
      length:
        parentOperationType === OPERATION_TYPE_STACK
          ? parentColumnCount
          : activeColumnsCount,
    },
    (_, i) => (i < activeColumnsCount ? activeColumnIds[i] : null)
  );

  return (
    <Box
      className="table-block" // Added className for easier targeting during debugging
      sx={{
        height: "100%",
        display: "flex",
        padding: "1px",
        flexDirection: "row",
        alignItems: "stretch",
        flexBasis: `${
          (activeColumnsCount / parentColumnCount || activeColumnsCount) * 100
        }%`,
        position: "relative",
        // Visual indication of alerts
        ...(hasAlerts && {
          border: "2px solid",
          borderColor: "warning.main",
          backgroundColor: "warning.light",
          opacity: 0.9,
        }),
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
          ...(hasAlerts && {
            color: "warning.dark",
            backgroundColor: "warning.light",
            fontWeight: "bold",
          }),
        }}
      >
        {table.name || table.id}
        {hasAlerts && ` ⚠ ${alertIds.length}`}
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
