import { ColumnTick, EnhancedColumnTick } from "../ColumnViews";
import { OPERATION_TYPE_STACK } from "../../slices/operationsSlice/Operation.js";
import withTableData from "./withTableData.jsx";
import { Box } from "@mui/material";

function TableBlock({
  // Props from withAssociatedAlerts via withTableData
  hasAlerts,
  // props via withTableData
  id,
  activeColumnIds,
  activeColumnsCount,

  // Props passed directly from parent
  parentOperationType,
  parentColumnCount,
  sx = {},
}) {
  if (import.meta.env.VITE_DEBUG_RENDER === "true") {
    console.debug("Rendering TableBlock for table:", id);
  }
  const ticks = Array.from(
    {
      length:
        parentOperationType === OPERATION_TYPE_STACK
          ? parentColumnCount
          : activeColumnsCount,
    },
    (_, i) => (i < activeColumnsCount ? activeColumnIds[i] : null)
  );
  console.log({ ticks, parentColumnCount, activeColumnsCount });

  return (
    <Box
      data-table="table-block" // Added className for easier targeting during debugging
      sx={{
        display: "flex",
        border: "5px solid #ddd",
        boxSizing: "border-box",
        flexDirection: "row",
        alignItems: "stretch",
        position: "relative",
        // Visual indication of alerts
        ...(hasAlerts && {
          border: "2px solid",
          borderColor: "warning.main",
          backgroundColor: "warning.light",
          opacity: 0.9,
        }),
        ...sx,
      }}
    >
      {/* <Typography
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
        {name || id}
        {hasAlerts && ` ⚠ ${alertIds.length}`}
      </Typography> */}
      {ticks.map((columnId, index) =>
        columnId === null ? (
          <ColumnTick
            key={`empty-${index}`} // Ensure unique key even when columnId is null
            id={null}
            sx={{
              outlineColor: "#f44336",
              backgroundColor: "rgb(253, 226, 224)",
            }}
          />
        ) : (
          <EnhancedColumnTick key={`${columnId}-${index}`} id={columnId} />
        )
      )}
    </Box>
  );
}

TableBlock.displayName = "TableBlock";

const EnhancedTableBlock = withTableData(TableBlock);

EnhancedTableBlock.displayName = "EnhancedTableBlock";

export { TableBlock, EnhancedTableBlock };
