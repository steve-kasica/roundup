/**
 * @fileoverview ColumnDetail Component
 *
 * Provides comprehensive statistical analysis and visualization for a single column,
 * displaying detailed metrics similar to those found in commercial data wrangling
 * software like Pandas' `.describe()` method.
 *
 * This component serves as the main details panel for column exploration during the
 * Exploratory Data Analysis (EDA) phase of data wrangling workflows.
 *
 * Key features:
 * - Column metadata (name, type, parent table)
 * - Statistical measures (count, nulls, duplicates, unique values)
 * - Data quality metrics (completeness, uniqueness)
 * - Multiple visualization views:
 *   - Value counts distribution
 *   - Raw values preview
 *   - String length distribution (for text columns)
 * - Alert/warning indicators for data quality issues
 *
 * The component integrates with Redux state through the withColumnData and
 * withAssociatedAlerts HOCs to access column statistics and related alerts.
 *
 * @module components/ColumnViews/ColumnDetail
 *
 * @example
 * <EnhancedColumnDetail id="column-123" />
 *
 * @see {@link https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.describe.html}
 *      Pandas describe() for comparison
 */

/**
 * ColumnDetail.jsx
 * ------------------------------------------------------------------------------
 *
 * This component provides many of the same statistics available in commercial data wrangling
 * software, including:
 *   - Pandas: Column name, Non-null count, Dtype (columnType) via `.describe`
 *
 * This stats aid the user in the precursory EDA that occurs during the Wrangling stage of
 * data work.
 */
import { withColumnData, withAssociatedAlerts } from "../HOC";
import {
  Box,
  Divider,
  Typography,
  Chip,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Warning } from "@mui/icons-material";
import { EnhancedColumnValues } from "./ColumnValues";
import ColumnValueCounts from "./ColumnValueCounts";
import ColumnValueLengths from "./ColumnValueLengths";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { useState } from "react";
import { duckDBToRoundupTypes } from "../../lib/duckdb";
import ColumnIcon from "../ColumnViews/ColumnIcon";
import { InfoIcon } from "../ui/icons";
import { EnhancedTableName } from "../TableView/TableName";
import DonutChart from "../visualization/DonutChart";
import DataListItem from "../ui/DataListItem";
import Swatch from "../ui/Swatch";
import { FloatNumber, IntegerNumber, ValueChip } from "../ui/text";

const VALUE_COUNTS_VIEW = "value_counts";
const RAW_VALUES_VIEW = "raw_values";
const STRING_LENGTH_VIEW = "string_length";

/**
 * ColumnDetail Component
 *
 * Displays comprehensive statistical information and visualizations for a column,
 * with toggleable views for different analysis perspectives.
 *
 * @component
 * @param {Object} props - Component props (provided via HOCs)
 * @param {string} props.name - Display name of the column
 * @param {string} props.columnType - DuckDB data type of the column
 * @param {string} props.parentId - ID of the parent table or operation
 * @param {string} props.id - Unique identifier for the column
 * @param {*} props.modeValue - Most frequently occurring value
 * @param {number} props.modeCount - Count of the mode value
 * @param {string} props.databaseName - Internal database name for the column
 * @param {number} props.approxUnique - Approximate count of unique values
 * @param {number} props.duplicateCount - Number of duplicate values
 * @param {number} props.nullCount - Number of null values
 * @param {number} props.count - Total number of values (including nulls)
 * @param {number} props.nonNullCount - Count of non-null values
 * @param {number} props.totalCount - Total count of associated alerts
 *
 * @returns {React.ReactElement} A detailed column analysis panel with statistics and visualizations
 *
 * @description
 * View modes:
 * - VALUE_COUNTS_VIEW: Bar chart of value frequency distribution
 * - RAW_VALUES_VIEW: List of actual values in the column
 * - STRING_LENGTH_VIEW: Distribution of string lengths (for text columns)
 */
const ColumnDetail = ({
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
  avg,
  // Props pased from `withAssociatedAlerts` via `withColumnData` HOC
  totalCount,
  nullColor = "#aaa",
  nonNullColor = "#555",
  uniqueColor = "#aaa",
  duplicateColor = "#555",
}) => {
  const [view, setView] = useState(VALUE_COUNTS_VIEW);

  const handleViewChange = (event, newView) => {
    if (newView !== null) {
      setView(newView);
    }
  };
  return (
    <Box
      className="ColumnDetail"
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
      <Accordion
        defaultExpanded
        disableGutters
        elevation={0}
        sx={{
          backgroundColor: "transparent",
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{ px: 0, minHeight: 36, "&.Mui-expanded": { minHeight: 36 } }}
        >
          <Typography variant="subsection-title" color="text.primary">
            Column metadata
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ px: 0, pt: 0 }}>
          <Box
            sx={{
              userSelect: "none",
            }}
          >
            <DataListItem>
              <Typography
                variant="data-primary"
                color="text.secondary"
                sx={{ fontWeight: "bold" }}
              >
                Parent Table
              </Typography>
              <EnhancedTableName id={parentId} variant="data-primary" />
            </DataListItem>
            <DataListItem>
              <Typography
                variant="data-primary"
                color="text.secondary"
                sx={{
                  fontWeight: "bold",
                }}
              >
                Column Type
              </Typography>
              <Typography variant="data-primary">
                {duckDBToRoundupTypes(columnType)}
              </Typography>
            </DataListItem>
            <DataListItem>
              <Typography
                variant="data-primary"
                color="text.secondary"
                sx={{ fontWeight: "bold" }}
              >
                Count
              </Typography>
              <Typography variant="data-primary">
                <IntegerNumber value={count} />
              </Typography>
            </DataListItem>
            <DataListItem>
              <Typography
                variant="data-primary"
                color="text.secondary"
                sx={{ fontWeight: "bold" }}
              >
                Mode
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <ValueChip label={`${modeValue || 0}`} />
                <Typography variant="data-primary">
                  (<IntegerNumber value={modeCount} />)
                </Typography>
              </Stack>
            </DataListItem>
            <DataListItem>
              <Typography
                variant="data-primary"
                color="text.secondary"
                sx={{ fontWeight: "bold" }}
              >
                Average
              </Typography>
              <Typography variant="data-primary">
                {<FloatNumber value={avg} /> || "N/A"}
              </Typography>
            </DataListItem>
            <DataListItem>
              <Typography
                variant="data-primary"
                color="text.secondary"
                sx={{ fontWeight: "bold" }}
              >
                Unique Values
              </Typography>
              <Typography variant="data-primary">
                <IntegerNumber value={approxUnique} />
              </Typography>
            </DataListItem>
          </Box>
        </AccordionDetails>
      </Accordion>
      <Divider />
      <Accordion
        defaultExpanded
        disableGutters
        elevation={0}
        sx={{
          backgroundColor: "transparent",
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{ px: 0, minHeight: 36, "&.Mui-expanded": { minHeight: 36 } }}
        >
          <Typography variant="subsection-title" color="text.primary">
            Data Quality Metrics
            {totalCount ? (
              <InfoIcon
                sx={{ ml: 1 }}
                tooltipText={`${totalCount} data quality alert${
                  totalCount > 1 ? "s" : ""
                } associated with this column.`}
                icon={<Warning sx={{ color: "warning.main", fontSize: 18 }} />}
              />
            ) : null}
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ px: 0, pt: 0 }}>
          <Box sx={{ width: "100%", marginBottom: 2 }}>
            <Typography
              variant="data-primary"
              color="text.secondary"
              sx={{ fontWeight: "bold" }}
              gutterBottom
            >
              Completeness
              <sup>
                <InfoIcon
                  tooltipText={
                    "The ratio of null to non-null values in a column."
                  }
                />
              </sup>
            </Typography>
            <Box
              sx={{
                display: "flex",
              }}
            >
              <DonutChart
                data={[
                  { name: "Non-null values", value: nonNullCount },
                  { name: "Null values", value: nullCount },
                ]}
                width={50}
                colors={[nonNullColor, nullColor]}
              />
              <Box
                flex={1}
                display={"flex"}
                flexDirection={"column"}
                justifyContent={"space-around"}
                alignItems={"center"}
                ml={3}
              >
                <Stack
                  direction="row"
                  spacing={1}
                  justifyContent={"space-between"}
                  sx={{ mb: 1, width: "100%" }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Swatch color={nonNullColor} />
                    <Typography variant="data-primary">
                      Non-null values
                    </Typography>
                  </Stack>
                  <Typography variant="data-primary">
                    <IntegerNumber value={nonNullCount} />
                  </Typography>
                </Stack>
                <Stack
                  direction="row"
                  spacing={1}
                  justifyContent={"space-between"}
                  sx={{ width: "100%" }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Swatch color={nullColor} />
                    <Typography
                      variant="data-primary"
                      sx={{
                        wordBreak: "keep-all",
                        wordWrap: "nowrap",
                      }}
                    >
                      Null values
                    </Typography>
                  </Stack>
                  <Typography variant="data-primary">
                    <IntegerNumber value={nullCount} />
                  </Typography>
                </Stack>
              </Box>
            </Box>
            <Box
              sx={{
                width: "100%",
                marginTop: 2,
              }}
            >
              <Typography
                variant="data-primary"
                sx={{ fontWeight: "bold" }}
                gutterBottom
              >
                Uniqueness
                <sup>
                  <InfoIcon
                    tooltipText={
                      "The ratio of unique values to duplicate values in a column."
                    }
                  />
                </sup>
              </Typography>
              <Box
                sx={{
                  display: "flex",
                }}
              >
                <DonutChart
                  data={[
                    { name: "Unique values", value: approxUnique },
                    { name: "Duplicate values", value: duplicateCount },
                  ]}
                  width={50}
                  colors={[uniqueColor, duplicateColor]}
                />
                <Box
                  flex={1}
                  display={"flex"}
                  flexDirection={"column"}
                  justifyContent={"space-around"}
                  alignItems={"center"}
                  ml={3}
                >
                  <Stack
                    direction="row"
                    spacing={1}
                    justifyContent={"space-between"}
                    sx={{ mb: 1, width: "100%" }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Swatch color={uniqueColor} />
                      <Typography variant="data-primary">
                        Unique values
                      </Typography>
                    </Stack>
                    <Typography variant="data-primary">
                      {approxUnique.toLocaleString()}
                    </Typography>
                  </Stack>
                  <Stack
                    direction="row"
                    spacing={1}
                    justifyContent={"space-between"}
                    sx={{ width: "100%" }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Swatch color={duplicateColor} />
                      <Typography variant="data-primary">
                        Duplicate values
                      </Typography>
                    </Stack>
                    <Typography variant="data-primary">
                      {duplicateCount.toLocaleString()}
                    </Typography>
                  </Stack>
                </Box>
              </Box>
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>
      <Divider />
      <Typography
        variant="subsection-title"
        color="text.primary"
        sx={{ my: 2 }}
      >
        Values counts
      </Typography>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <ToggleButtonGroup
          value={view}
          exclusive
          onChange={handleViewChange}
          size="small"
          sx={{ flexWrap: "wrap" }}
        >
          <ToggleButton value={VALUE_COUNTS_VIEW}>Value</ToggleButton>
          <ToggleButton value={RAW_VALUES_VIEW}>Index</ToggleButton>
          <ToggleButton value={STRING_LENGTH_VIEW}>Length</ToggleButton>
        </ToggleButtonGroup>
      </Box>
      <Box
        className="container"
        sx={{ mt: "10px", flexGrow: 1, overflow: "hidden" }}
      >
        {view === VALUE_COUNTS_VIEW ? (
          <ColumnValueCounts id={id} approxUnique={approxUnique} />
        ) : view === RAW_VALUES_VIEW ? (
          <EnhancedColumnValues id={id} />
        ) : view === STRING_LENGTH_VIEW ? (
          <ColumnValueLengths id={id} />
        ) : null}
      </Box>
    </Box>
  );
};

ColumnDetail.displayName = "ColumnDetail";

const EnhancedColumnDetail = withAssociatedAlerts(withColumnData(ColumnDetail));

EnhancedColumnDetail.displayName = "EnhancedColumnDetail";

export { EnhancedColumnDetail, ColumnDetail };
