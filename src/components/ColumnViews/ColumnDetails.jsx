/**
 * ColumnDetails.jsx
 * ------------------------------------------------------------------------------
 *
 * This component provides many of the same statistics available in commerical data wrangling
 * software, including:
 *   - Pandas: Column name, Non-null count, Dtype (columnType) via `.describe`
 *
 * This stats aid the user in the precusory EDA that occurs during the Wrangling stage of
 * data work.
 */
import withColumnData from "./withColumnData";
import { Box, Divider, Typography, Chip, Stack } from "@mui/material";
import { Warning } from "@mui/icons-material";
import DescriptionList from "../ui/DescriptionList";
import { EnhancedColumnValues } from "./ColumnValues";
import ColumnValueCounts from "./ColumnValueCounts";
import ColumnValueLengths from "./ColumnValueLengths";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { useState } from "react";
import { duckDBToRoundupTypes } from "../../lib/duckdb";
import ColumnIcon from "./ColumnIcon";

const VALUE_COUNTS_VIEW = "value_counts";
const RAW_VALUES_VIEW = "raw_values";
const STRING_LENGTH_VIEW = "string_length";

const ColumnDetails = ({
  // Props passed via `withColumnData` HOC
  name,
  columnType,
  id,
  modeValue,
  modeCount,
  databaseName,
  uniqueCount,
  duplicateCount,
  nullCount,
  completeness,
  // Props pased from `withAssociatedAlerts` via `withColumnData` HOC
  alertIds,
  totalCount,
}) => {
  const [view, setView] = useState(VALUE_COUNTS_VIEW);

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
        ...(totalCount && {
          border: "2px solid",
          borderColor: "warning.main",
          backgroundColor: "warning.light",
          borderRadius: 1,
        }),
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <ColumnIcon />
          <Typography
            variant="h5"
            sx={{ ...(totalCount && { color: "warning.dark" }) }}
          >
            {name || databaseName || id}
          </Typography>
        </Stack>

        {totalCount && (
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
          type: `${duckDBToRoundupTypes(columnType)} (${columnType})`,
          null: nullCount.toLocaleString(),
          completeness: `${completeness * 100}%`,
          unique: uniqueCount.toLocaleString(),
          duplicate: duplicateCount.toLocaleString(),
          mode: `${modeValue || 0} (${modeCount?.toLocaleString() || 0})`,
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
          sx={{ flexWrap: "wrap" }}
        >
          <ToggleButton value={VALUE_COUNTS_VIEW}>Counts</ToggleButton>
          <ToggleButton value={RAW_VALUES_VIEW}>Values</ToggleButton>
          <ToggleButton value={STRING_LENGTH_VIEW}>Length</ToggleButton>
        </ToggleButtonGroup>
      </Box>
      <Box sx={{ mt: "10px", flexGrow: 1, overflow: "auto" }}>
        {view === VALUE_COUNTS_VIEW ? (
          <ColumnValueCounts id={id} uniqueCount={uniqueCount} />
        ) : view === RAW_VALUES_VIEW ? (
          <EnhancedColumnValues id={id} />
        ) : view === STRING_LENGTH_VIEW ? (
          <ColumnValueLengths id={id} />
        ) : null}
      </Box>
    </Box>
  );
};

ColumnDetails.displayName = "ColumnDetails";

const EnhancedColumnDetails = withColumnData(ColumnDetails);

EnhancedColumnDetails.displayName = "EnhancedColumnDetails";

export { EnhancedColumnDetails, ColumnDetails };
