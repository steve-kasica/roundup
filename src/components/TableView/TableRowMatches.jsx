/* eslint-disable react/prop-types */
import { Box, styled } from "@mui/material";
import withTableData from "./withTableData";
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
      "& > *": {
        backgroundColor: "#aaa !important",
      },
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
  table,
  columnCount,
  columnIds,
  key,
  tablePosition, // "left" or "right"
  selectedOperationColumnIds = [],
  matches,
  operationRowCount,
  hoveredRowLabel = null,
  toggledMatches = {},
  onBlockEnter = () => {},
  onBlockLeave = () => {},
  onBlockClick = () => {},
  onColumnClick = () => {},
  onTableLabelClick = () => {},
}) => {
  const columnWidth = (1 / columnCount) * 100 + "%";

  const handleColumnClick = useCallback(
    (event, columnId) => {
      onColumnClick(event, table.id, columnId);
    },
    [onColumnClick, table.id]
  );

  return (
    <Box
      display="flex"
      alignItems="center"
      flexDirection={"column"}
      flex={1}
      height="100%"
      width="100%"
    >
      <EnhancedTableLabel
        id={table.id}
        includeIcon={false}
        onClick={(event) => onTableLabelClick(event, table.id)}
      />
      <Box display="flex" width="100%" gap={"1px"}>
        {columnIds.map((columnId) => (
          <Box
            key={columnId}
            backgroundColor="#ddd"
            width={columnWidth}
            display="flex"
            alignItems="center"
            justifyContent="center"
            height={"25px"}
            cursor="pointer"
            sx={{
              ...(columnId === key && {
                // border: "2px solid",
                fontWeight: "bold",
                position: "relative",
                "&:before": {
                  content: '"🔑"',
                  position: "absolute",
                  top: "-29px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  backgroundColor: "primary.main",
                  borderRadius: "50%",
                  fontSize: "10px",
                  color: "white",
                  width: "15px",
                  height: "15px",
                  textAlign: "center",
                  lineHeight: "15px",
                  padding: "5px",
                  zIndex: 1,
                },
              }),
            }}
            onClick={(event) => handleColumnClick(event, columnId)}
          >
            <EnhancedColumnName
              id={columnId}
              isSelected={selectedOperationColumnIds.includes(columnId)}
              sx={{
                fontSize: "0.8rem",
                cursor: "pointer",
                fontWeight: "inherit",
                "&:hover": {
                  backgroundColor: "#555",
                },
                ...(selectedOperationColumnIds.includes(columnId) && {
                  backgroundColor: "secondary.light",
                  border: "2px solid",
                  borderColor: "secondary.main",
                  fontWeight: "bold",
                  "&:hover": {
                    backgroundColor: "secondary.main",
                    color: "secondary.contrastText",
                  },
                }),
              }}
            />
          </Box>
        ))}
      </Box>
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
              onClick={(event) => onBlockClick(event, table.id, label)}
            >
              {columnIds.map((columnId) => (
                <Box
                  key={columnId}
                  sx={{
                    width: (1 / columnCount) * 100 + "%",
                    height: "100%",
                    backgroundColor: "#ccc",
                  }}
                ></Box>
              ))}
            </RowBlock>
          ))}
      </Box>
    </Box>
  );
};

const EnhancedTableRowMatches = withTableData(TableRowMatches);

export { EnhancedTableRowMatches, TableRowMatches };
