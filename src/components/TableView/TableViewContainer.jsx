import {
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import React from "react";
import withTableData from "../HOC/withTableData";

const TableViewContainer = withTableData(
  ({ table, activeColumnIds, children }) => {
    return (
      <Box display={"flex"} flexDirection="column">
        <Box
          display={"flex"}
          justifyContent="space-between"
          alignContent="center"
          mb={2}
        >
          <Typography variant="h6">
            Table View: {table?.name} ({"TK"} x {activeColumnIds.length})
          </Typography>
          <ToggleButtonGroup size="small" exclusive value={"high-level"}>
            <ToggleButton value="high-level">Low</ToggleButton>
            <ToggleButton value="raw-rows">High</ToggleButton>
          </ToggleButtonGroup>
        </Box>
        {children}
      </Box>
    );
  }
);

export default TableViewContainer;
