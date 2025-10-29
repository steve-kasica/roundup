/**
 *
 *
 * This component provides many of the same statistics available in commerical data wrangling
 * software, including:
 *   - Pandas: Column name, Non-null count, Dtype (columnType) via `.describe`
 *
 *
 * This stats aid the user in the precusory EDA that occurs during the Wrangling stage of
 * data work.
 */
import withColumnData from "./withColumnData";
import { Box, Divider, Typography, Alert, Chip } from "@mui/material";
import { Warning } from "@mui/icons-material";
import DescriptionList from "../ui/DescriptionList";
import { EnhancedColumnValues } from "./ColumnValues";
import ColumnValueCounts from "./ColumnValueCounts";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { useState } from "react";

const ColumnDetails = withColumnData(
  ({
    column,
    uniqueCount,
    duplicateCount,
    mode,
    nullCount,
    completeness,
    // Props pased from `withAssociatedAlerts` via `withColumnData` HOC
    alertIds,
    hasAlerts,
  }) => {
    const [view, setView] = useState("value counts");

    const handleViewChange = (event, newView) => {
      if (newView !== null) {
        setView(newView);
      }
    };
    return (
      <Box
        sx={{
          p: 1,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          ...(hasAlerts && {
            border: "2px solid",
            borderColor: "warning.main",
            backgroundColor: "warning.light",
            borderRadius: 1,
          }),
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography
            variant="h5"
            sx={{ ...(hasAlerts && { color: "warning.dark" }) }}
          >
            {column.name || column.columnName || column.id}
          </Typography>
          {hasAlerts && (
            <Chip
              icon={<Warning />}
              label={`${alertIds.length} alert${
                alertIds.length !== 1 ? "s" : ""
              }`}
              color="warning"
              size="small"
            />
          )}
        </Box>
        <Divider sx={{ my: 1 }} />
        <DescriptionList
          data={{
            type: column.columnType,
            null: nullCount.toLocaleString(),
            completeness: `${completeness * 100}%`,
            unique: uniqueCount.toLocaleString(),
            duplicate: duplicateCount.toLocaleString(),
            mode: `${column.modeValue || 0} (${
              column.modeCount.toLocaleString() || 0
            })`,
          }}
        />
        <Divider sx={{ my: 1 }} />
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" color="text.secondary">
            Values
          </Typography>
          <ToggleButtonGroup
            value={view}
            exclusive
            onChange={handleViewChange}
            size="small"
          >
            <ToggleButton value="value counts">Counts</ToggleButton>
            <ToggleButton value="raw values">Values</ToggleButton>
          </ToggleButtonGroup>
        </Box>
        <Box sx={{ mt: "10px", flexGrow: 1, overflow: "auto" }}>
          {view === "value counts" && (
            <ColumnValueCounts
              columnName={column.columnName}
              tableId={column.tableId}
              uniqueCount={uniqueCount}
            />
          )}
          {view === "raw values" && <EnhancedColumnValues id={column.id} />}
        </Box>
      </Box>
    );
  }
);

export default ColumnDetails;
