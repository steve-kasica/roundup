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
import { withColumnData, withAssociatedAlerts } from "../HOC";
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
import SingleBar from "../visualization/SingleBar";
import { ProportionBar } from "../visualization";
import { InfoIcon } from "../ui/icons";
import { EnhancedTableName, TableName } from "../TableView/TableName";

const VALUE_COUNTS_VIEW = "value_counts";
const RAW_VALUES_VIEW = "raw_values";
const STRING_LENGTH_VIEW = "string_length";

const ColumnDetails = ({
  // Props passed via `withColumnData` HOC
  name,
  columnType,
  parentId,
  id,
  modeValue,
  modeCount,
  databaseName,
  approxUnique,
  duplicateCount,
  nullCount,
  count,
  nonNullCount,
  // Props pased from `withAssociatedAlerts` via `withColumnData` HOC
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
      className="ColumnDetails"
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
            sx={{
              userSelect: "none",
              ...(totalCount && { color: "warning.dark" }),
            }}
          >
            {name || databaseName || id}
          </Typography>
        </Stack>
      </Box>
      <Divider sx={{ my: 1 }} />
      <Box
        sx={{
          userSelect: "none",
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          justifyContent={"space-between"}
          alignItems="center"
          sx={{ mb: 1 }}
        >
          <Typography variant="subtitle1" color="text.secondary">
            Parent Table
          </Typography>
          <EnhancedTableName id={parentId} />
        </Stack>
        <Stack
          direction="row"
          spacing={1}
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 1 }}
        >
          <Typography variant="subtitle1" color="text.secondary">
            Column Type
          </Typography>
          <Typography variant="body2">
            {duckDBToRoundupTypes(columnType)}
          </Typography>
        </Stack>
        <Stack
          direction="row"
          spacing={1}
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 1 }}
        >
          <Typography variant="subtitle1" color="text.secondary">
            Count
          </Typography>
          <Typography variant="body2">{count.toLocaleString()}</Typography>
        </Stack>
        <Stack
          direction="row"
          spacing={1}
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 1 }}
        >
          <Typography variant="subtitle1" color="text.secondary">
            Mode
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography
              variant="body2"
              title={modeValue !== null ? `${modeValue}` : "N/A"}
              sx={{
                maxWidth: "100px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {modeValue !== null ? `${modeValue}` : "N/A"}
            </Typography>
            <Chip label={`${modeCount?.toLocaleString() || 0}`} size="small" />
          </Stack>
        </Stack>
        <Stack
          direction="row"
          spacing={1}
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 1 }}
        >
          <Typography variant="subtitle1" color="text.secondary">
            Unique Values
          </Typography>
          <Typography variant="body2">
            {approxUnique.toLocaleString()}
          </Typography>
        </Stack>
      </Box>
      <Divider sx={{ my: 1 }} />
      <Box sx={{ width: "100%", marginBottom: 2 }}>
        <Typography gutterBottom>
          Completeness
          <sup>
            <InfoIcon
              tooltipText={"The ratio of null to non-null values in a column."}
            />
          </sup>
        </Typography>
        <ProportionBar
          data={{
            "Null values": nullCount,
            "Non-null values": nonNullCount,
          }}
          colorScale={(key) => {
            switch (key) {
              case "Non-null values":
                return "#555";
              case "Null values":
                return "#ccc";
              default:
                return "#ccc";
            }
          }}
        />
      </Box>
      <Box
        sx={{
          width: "100%",
          marginBottom: 2,
        }}
      >
        <Typography gutterBottom>
          Uniqueness
          <sup>
            <InfoIcon
              tooltipText={
                "The ratio of unique values to total values in a column."
              }
            />
          </sup>
        </Typography>
        <ProportionBar
          data={{
            "Duplicate values": duplicateCount,
            "Unique values": approxUnique,
          }}
          colorScale={(key) => {
            switch (key) {
              case "Duplicate values":
                return "#555";
              case "Unique values":
                return "#ccc";
              default:
                return "#ccc";
            }
          }}
        />
      </Box>
      <Divider />
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
          <ColumnValueCounts id={id} uniqueCount={approxUnique} />
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

const EnhancedColumnDetails = withAssociatedAlerts(
  withColumnData(ColumnDetails)
);

EnhancedColumnDetails.displayName = "EnhancedColumnDetails";

export { EnhancedColumnDetails, ColumnDetails };
