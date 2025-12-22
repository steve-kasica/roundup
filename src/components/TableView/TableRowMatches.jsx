/* eslint-disable react/prop-types */
import { Box, styled } from "@mui/material";
import { withTableData, withAssociatedAlerts } from "../HOC";
import { EnhancedTableLabel } from "./TableLabel";
import { EnhancedColumnName } from "../ColumnViews";
import { useCallback } from "react";

const RowBlock = styled(Box)(({ height, isHovered, isToggled, isNull }) => ({
  display: "flex",
  width: "100%",
  height: height || "20px",
  gap: "1px",
  cursor: "pointer",
  transition: "all 0.2s ease-in-out",
  opacity: isToggled ? 1 : 0.3,
  filter: isToggled ? "none" : "grayscale(0.8)",
  ...(isNull && {
    background: `repeating-linear-gradient(45deg, ${"#f5f5f5"}, ${"#f5f5f5"} 10px, ${"#e0e0e0"} 10px, ${"#e0e0e0"} 20px)`,
    "& > *": {
      backgroundColor: "transparent !important",
      outline: "1px dashed #d5d5d5",
      backgroundImage: `repeating-linear-gradient(45deg, ${"#f0f0f0"}, ${"#f0f0f0"} 10px, ${
        !isHovered && isToggled ? "#d5d5d5" : "#aaa"
      } 10px, ${!isHovered && isToggled ? "#d5d5d5" : "#aaa"} 20px)`,
    },
  }),
  ...(isHovered &&
    isToggled &&
    !isNull && {
      boxShadow: "0 1px 4px rgba(0, 0, 0, 0.15)",
      zIndex: 1,
      // "& > *": {
      //   backgroundColor: "#aaa !important",
      // },
    }),
  //   "&:hover": {
  //     boxShadow: "0 1px 4px rgba(0, 0, 0, 0.15)",
  //     zIndex: 1,
  //     opacity: 1,
  //     filter: "none",
  //     "& > *": {
  //       backgroundColor: "#aaa !important",
  //     },
  //   },
}));

const TableRowMatches = ({
  id,
  columnCount,
  columnIds,
  // Props from withAssociatedAlerts via withTableData
  alertIds, // eslint-disable-line no-unused-vars
  totalCount,
  // Props passed directyly from parent component
  tablePosition, // "left" or "right"
  matches,
  operationRowCount,
  hoveredRowLabel = null,
  toggledMatches = {},
  onBlockEnter = () => {},
  onBlockLeave = () => {},
  onBlockClick = () => {},
  onBlockCellClick = () => {},
}) => {
  if (import.meta.env.VITE_DEBUG_RENDER === "true") {
    console.debug("Rendering TableBlock for table:", id);
  }
  return (
    <Box
      display="flex"
      alignItems="center"
      flexDirection={"column"}
      flex={1}
      height="100%"
      width="100%"
      sx={{
        ...(totalCount && {
          border: "2px solid",
          borderColor: "warning.main",
          backgroundColor: "warning.light",
          borderRadius: 1,
          padding: "2px",
        }),
      }}
    >
      <Box
        height={"100%"}
        width="100%"
        flex={1}
        display={"flex"}
        flexDirection="column"
        gap={0.5}
      >
        {Object.entries(matches)
          .filter(([label, matchCount]) => matchCount > 0) // eslint-disable-line no-unused-vars
          .map(([label, matchCount], index) => (
            <RowBlock
              key={label + index}
              height={(matchCount / operationRowCount) * 100 + "%"}
              isHovered={hoveredRowLabel === label}
              isToggled={toggledMatches[label] !== false}
              isNull={
                (tablePosition === "left" && label === "zero_to_one_matches") ||
                (tablePosition === "right" && label === "one_to_zero_matches")
              }
              onMouseEnter={(event) => onBlockEnter(event, label)}
              onMouseLeave={(event) => onBlockLeave(event, label)}
              onClick={(event) => onBlockClick(event, id, label)}
            >
              {columnIds.map((columnId) => (
                <Box
                  key={columnId}
                  sx={{
                    width: (1 / columnCount) * 100 + "%",
                    height: "100%",
                    backgroundColor: "#ccc",
                    "&:hover": {
                      backgroundColor: "#999",
                    },
                    onClick: (event) =>
                      onBlockCellClick(event, id, columnId, label),
                  }}
                ></Box>
              ))}
            </RowBlock>
          ))}
      </Box>
    </Box>
  );
};

const EnhancedTableRowMatches = withAssociatedAlerts(
  withTableData(TableRowMatches)
);

export { EnhancedTableRowMatches, TableRowMatches };
