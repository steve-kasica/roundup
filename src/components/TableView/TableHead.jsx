/* eslint-disable react/prop-types */
import React from "react";
import { Box } from "@mui/material";
import ColumnTableHeader from "../ColumnViews/ColumnTableHeader";
import ColumnHeader from "../ColumnViews/ColumnHeader";
import { COLUMN_WIDTHS } from "./index.js";

const TableHead = ({
  activeColumnIds,
  selectedColumnIds,
  handleColumnClick,
}) => {
  const headerCellSx = {
    padding: "6px 16px",
    borderBottom: "2px solid",
    borderColor: "divider",
    display: "flex",
    alignItems: "center",
    fontWeight: "bold",
    backgroundColor: "background.paper",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  };

  const indexHeaderSx = {
    ...headerCellSx,
    position: "sticky",
    left: 0,
    zIndex: 3,
    width: COLUMN_WIDTHS.index,
    minWidth: COLUMN_WIDTHS.index,
    maxWidth: COLUMN_WIDTHS.index,
    borderRight: "1px solid",
    borderColor: "divider",
    justifyContent: "center",
  };

  const dataHeaderSx = {
    ...headerCellSx,
    width: COLUMN_WIDTHS.default,
    minWidth: COLUMN_WIDTHS.default,
    maxWidth: COLUMN_WIDTHS.default,
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-evenly",
        backgroundColor: "background.paper",
        position: "sticky",
        top: 0,
        zIndex: 2,
      }}
    >
      {/* Data column headers */}
      {activeColumnIds.map((columnId) => (
        <Box
          key={columnId}
          sx={{
            ...dataHeaderSx,
            backgroundColor: selectedColumnIds.includes(columnId)
              ? "#e3f2fd"
              : "background.paper",
            cursor: "pointer",
            "&:hover": {
              backgroundColor: selectedColumnIds.includes(columnId)
                ? "#bbdefb"
                : "action.hover",
            },
          }}
          onClick={(event) => handleColumnClick(event, columnId)}
        >
          <ColumnHeader id={columnId} />
        </Box>
      ))}
    </Box>
  );
};

export default TableHead;
