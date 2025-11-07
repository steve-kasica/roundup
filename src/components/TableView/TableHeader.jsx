/* eslint-disable react/prop-types */
import { Box, Tooltip } from "@mui/material";
import withTableData from "./withTableData";
import { EnhancedColumnName } from "../ColumnViews";
import { useSelector } from "react-redux";

const TableHeader = ({
  activeColumnIds,
  columnCount,
  // Props passed directly from parent component
  keyColumnId,
  onColumnClick,
}) => {
  if (import.meta.env.VITE_DEBUG_RENDER === "true") {
    console.debug("Rendering TableHeader:", {
      keyColumnId,
      columnCount,
      activeColumnIds,
    });
  }
  const columnWidth = (1 / columnCount) * 100 + "%";

  return (
    <Box display="flex" width="100%" gap={"1px"}>
      {activeColumnIds.map((columnId) => {
        return (
          <Box
            key={columnId}
            backgroundColor="#ddd"
            width={columnWidth}
            display="flex"
            alignItems="center"
            overflow="hidden"
            onClick={(event) => onColumnClick(event, columnId)}
            sx={{
              textOverflow: "ellipsis",
              cursor: "pointer",
              "&:hover": {
                fontWeight: "700",
                backgroundColor: "action.hover",
              },
            }}
          >
            <EnhancedColumnName
              id={columnId}
              sx={{
                width: columnWidth,
                fontSize: "0.75rem",
                fontWeight: "600",
                cursor: "pointer",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                padding: "8px 4px",
                color: "text.primary",
                userSelect: "none",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                width: "100%",
              }}
            />
          </Box>
        );
      })}
    </Box>
  );
};

const EnhancedTableHeader = withTableData(TableHeader);

export { EnhancedTableHeader, TableHeader };
