import { Typography, Box } from "@mui/material";
import { DragIndicator, TableChart } from "@mui/icons-material";
import PropTypes from "prop-types";

/**
 * Custom drag preview component that shows multiple tables stacked
 */
function StackedTableDragPreview({ tables, primaryTable }) {
  const maxStackCount = 3; // Maximum number of stacked previews to show
  const stackOffset = 4; // Pixels to offset each stack layer

  return (
    <Box
      sx={{
        position: "relative",
        minWidth: "300px",
        cursor: "grabbing",
        userSelect: "none",
        pointerEvents: "none",
      }}
    >
      {/* Background stacked layers */}
      {tables.slice(0, maxStackCount).map((_, index) => {
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
                  padding: "8px 12px",
                  minHeight: "40px",
                }}
              >
                <DragIndicator
                  sx={{
                    color: "#ff6f00",
                    mr: 1,
                    fontSize: "20px",
                  }}
                />
                <TableChart
                  sx={{
                    color: "#ff6f00",
                    mr: 1,
                    fontSize: "18px",
                  }}
                />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "white",
                      fontWeight: "bold",
                      fontSize: "14px",
                      textShadow: "0 1px 2px rgba(0,0,0,0.5)",
                    }}
                  >
                    {primaryTable.name}
                  </Typography>
                  {tables.length > 1 && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: "rgba(255,255,255,0.9)",
                        fontSize: "11px",
                        textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                      }}
                    >
                      +{tables.length - 1} more tables
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
                    variant="caption"
                    sx={{
                      color: "white",
                      fontWeight: "bold",
                      fontSize: "12px",
                      textShadow: "0 1px 2px rgba(0,0,0,0.5)",
                    }}
                  >
                    {tables.length}
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
      {tables.length > maxStackCount && (
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
            variant="caption"
            sx={{
              color: "white",
              fontWeight: "bold",
              fontSize: "10px",
              textShadow: "0 1px 2px rgba(0,0,0,0.5)",
            }}
          >
            +{tables.length - maxStackCount}
          </Typography>
        </Box>
      )}
    </Box>
  );
}

StackedTableDragPreview.propTypes = {
  tables: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
  primaryTable: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
};

export default StackedTableDragPreview;
