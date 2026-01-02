/**
 * @fileoverview TableDragPreview Component
 *
 * A custom drag preview component for displaying multiple tables during drag-and-drop
 * operations. Shows a stacked visualization of dragged tables with icons, names, and
 * metadata, providing clear visual feedback during drag interactions.
 *
 * Features:
 * - Stacked table visualization
 * - Table icons and names
 * - Metadata display (rows x columns)
 * - Multiple table support
 * - Custom drag preview styling
 * - Integration with Redux for table data
 *
 * @module components/TableView/TableDragPreview
 *
 * @example
 * <TableDragPreview tableIds={[tableId1, tableId2]} />
 */

/* eslint-disable react/prop-types */
import { Typography, Box } from "@mui/material";
import { DragIndicator, TableChart } from "@mui/icons-material";
import { useSelector } from "react-redux";
import { selectTablesById } from "../../slices/tablesSlice";

/**
 * Custom drag preview component that shows multiple tables stacked
 */
function TableDragPreview({ tableIds }) {
  if (import.meta.env.VITE_DEBUG_RENDER === "true") {
    console.debug("Rendering TableDragPreview for tables:", tableIds);
  }
  const primaryTableId = tableIds[tableIds.length - 1];
  const primaryTable = useSelector((state) =>
    selectTablesById(state, primaryTableId)
  );
  const maxStackCount = 3; // Maximum number of stacked previews to show
  const stackOffset = 4; // Pixels to offset each stack layer

  return (
    <Box
      sx={{
        position: "relative",
        width: "200px",
        cursor: "grabbing",
        userSelect: "none",
        pointerEvents: "none",
      }}
    >
      {/* Background stacked layers */}
      {tableIds.slice(0, maxStackCount).map((_, index) => {
        const isTopLayer = index === 0;
        const zIndex = maxStackCount - index;
        const offset = index * stackOffset;

        return (
          <Box
            key={index}
            sx={{
              position: isTopLayer ? "relative" : "absolute",
              top: isTopLayer ? 0 : offset,
              left: isTopLayer ? 0 : offset,
              right: isTopLayer ? 0 : -offset,
              zIndex,
              backgroundColor: isTopLayer
                ? "rgba(255, 152, 0, 0.95)"
                : "rgba(255, 152, 0, 0.7)",
              border: isTopLayer ? "2px solid #ff9800" : "1px solid #ffb74d",
              borderRadius: "6px",
              boxShadow: isTopLayer
                ? "0 8px 16px rgba(255, 152, 0, 0.4)"
                : "0 4px 8px rgba(255, 152, 0, 0.3)",
              transform: `scale(${1 - index * 0.02}) rotate(${index * 0.5}deg)`,
              opacity: isTopLayer ? 1 : 0.8 - index * 0.2,
            }}
          >
            {isTopLayer && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  minHeight: "10px",
                }}
              >
                <DragIndicator
                  sx={{
                    color: "#ff6f00",
                    mr: 1,
                    fontSize: "12px",
                  }}
                />
                <TableChart
                  sx={{
                    color: "#ff6f00",
                    mr: 1,
                    fontSize: "12px",
                  }}
                />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography
                    variant="data-primary"
                  >
                    {primaryTable.name}
                  </Typography>
                  {tableIds.length > 1 && (
                    <Typography
                      variant="data-secondary"
                    >
                      +{tableIds.length - 1} more table
                      {tableIds.length - 1 > 1 ? "s" : ""}
                    </Typography>
                  )}
                </Box>
                <Box
                  sx={{
                    backgroundColor: "rgba(255,255,255,0.2)",
                    borderRadius: "12px",
                    px: 1.5,
                    py: 0.5,
                    border: "1px solid rgba(255,255,255,0.3)",
                  }}
                >
                  <Typography
                    variant="data-small"
                  >
                    {tableIds.length}
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Empty stack layers for visual effect */}
            {!isTopLayer && <Box sx={{ height: "40px", opacity: 0 }} />}
          </Box>
        );
      })}

      {/* Show additional count if more than maxStackCount */}
      {tableIds.length > maxStackCount && (
        <Box
          sx={{
            position: "absolute",
            top: (maxStackCount + 1) * stackOffset,
            left: (maxStackCount + 1) * stackOffset,
            backgroundColor: "rgba(255, 152, 0, 0.9)",
            border: "1px solid #ffb74d",
            borderRadius: "50%",
            width: "24px",
            height: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: maxStackCount + 1,
            boxShadow: "0 2px 4px rgba(255, 152, 0, 0.3)",
          }}
        >
          <Typography
            variant="data-micro"
          >
            +{tableIds.length - maxStackCount}
          </Typography>
        </Box>
      )}
    </Box>
  );
}

export default TableDragPreview;
