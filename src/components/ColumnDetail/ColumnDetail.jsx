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
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  ButtonGroup,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Warning, ChevronLeft, ChevronRight } from "@mui/icons-material";
import ColumnValueCounts from "./ColumnValueCounts";
import ColumnValueLengths from "./ColumnValueLengths";
import { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { duckDBToRoundupTypes } from "../../lib/duckdb";
import ColumnIcon from "../ColumnViews/ColumnIcon";
import { InfoIcon } from "../ui/icons";
import { EnhancedTableName } from "../TableView/TableName";
import DonutChart from "../visualization/DonutChart";
import DataListItem from "../ui/DataListItem";
import Swatch from "../ui/Swatch";
import { FloatNumber, IntegerNumber, MoreInfo, ValueChip } from "../ui/text";
import { selectColumnIdsByParentId } from "../../slices/columnsSlice";
import { setFocusedColumnIds } from "../../slices/uiSlice";

const VALUE_COUNTS_VIEW = "value_counts";
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
  min,
  max,
  // Props pased from `withAssociatedAlerts` via `withColumnData` HOC
  totalCount,
  nullColor = "#aaa",
  nonNullColor = "#555",
  uniqueColor = "#aaa",
  duplicateColor = "#555",
}) => {
  const [view, setView] = useState(VALUE_COUNTS_VIEW);
  const dispatch = useDispatch();
  const siblingColumnIds = useSelector((state) =>
    selectColumnIdsByParentId(state, parentId),
  );
  const currentIndex = siblingColumnIds.indexOf(id);
  const isFirstColumn = currentIndex <= 0;
  const isLastColumn = currentIndex >= siblingColumnIds.length - 1;

  const handleViewChange = (event, newView) => {
    if (newView !== null) {
      setView(newView);
    }
  };

  const navigateToPrevColumn = useCallback(() => {
    if (!isFirstColumn) {
      dispatch(setFocusedColumnIds([siblingColumnIds[currentIndex - 1]]));
    }
  }, [dispatch, siblingColumnIds, currentIndex, isFirstColumn]);

  const navigateToNextColumn = useCallback(() => {
    if (!isLastColumn) {
      dispatch(setFocusedColumnIds([siblingColumnIds[currentIndex + 1]]));
    }
  }, [dispatch, siblingColumnIds, currentIndex, isLastColumn]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const tag = event.target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") {
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        navigateToPrevColumn();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        navigateToNextColumn();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigateToPrevColumn, navigateToNextColumn]);

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
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
          <ColumnIcon />
          <Typography
            variant="h5"
            sx={{
              userSelect: "none",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              ...(totalCount && { color: "warning.dark" }),
            }}
          >
            {name || databaseName || id}
          </Typography>
        </Stack>
        <ButtonGroup size="small" aria-label="column navigation">
          <IconButton
            size="small"
            onClick={navigateToPrevColumn}
            disabled={isFirstColumn}
            aria-label="previous column"
          >
            <ChevronLeft fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={navigateToNextColumn}
            disabled={isLastColumn}
            aria-label="next column"
          >
            <ChevronRight fontSize="small" />
          </IconButton>
        </ButtonGroup>
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
            Metadata
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
                Parent table
                <MoreInfo text="The table that this column belongs to." />
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
                <MoreInfo text="The data type of this column." />
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
                <MoreInfo text="The total number of values in this column, including nulls." />
              </Typography>
              <Typography variant="data-primary">
                <IntegerNumber value={count} />
              </Typography>
            </DataListItem>
            <DataListItem disabled={isNaN(modeCount)}>
              <Typography
                variant="data-primary"
                color="text.secondary"
                sx={{ fontWeight: "bold", whiteSpace: "nowrap" }}
              >
                Mode
                <MoreInfo text="The most frequently occurring value in this column." />
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="data-primary">
                  {isNaN(modeCount) ? (
                    "N/A"
                  ) : (
                    <>
                      {" "}
                      <ValueChip
                        label={`${modeValue || 0}`}
                        sx={{
                          maxWidth: "150px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      />
                      <IntegerNumber value={modeCount || 0} />
                    </>
                  )}
                </Typography>
              </Stack>
            </DataListItem>
            <DataListItem
              disabled={approxUnique === null || approxUnique === 0}
            >
              <Typography
                variant="data-primary"
                color="text.secondary"
                sx={{ fontWeight: "bold" }}
              >
                Unique Values
                <MoreInfo text="The approximate number of unique values in this column." />
              </Typography>
              <Typography variant="data-primary">
                {approxUnique === null || approxUnique === 0 ? (
                  "N/A"
                ) : (
                  <IntegerNumber value={approxUnique} />
                )}
              </Typography>
            </DataListItem>
            <DataListItem disabled={min === null}>
              <Typography
                variant="data-primary"
                color="text.secondary"
                sx={{
                  fontWeight: "bold",
                }}
              >
                Min
                <MoreInfo text="The minimum value in this column." />
              </Typography>
              <Typography variant="data-primary">
                {min === null ? "N/A" : <FloatNumber value={min} />}
              </Typography>
            </DataListItem>
            <DataListItem disabled={max === null}>
              <Typography
                variant="data-primary"
                color="text.secondary"
                sx={{
                  fontWeight: "bold",
                }}
              >
                Max
                <MoreInfo text="The maximum value in this column." />
              </Typography>
              <Typography variant="data-primary">
                {max === null ? "N/A" : <FloatNumber value={max} />}
              </Typography>
            </DataListItem>
            <DataListItem disabled={avg === null || avg === undefined}>
              <Typography
                variant="data-primary"
                color="text.secondary"
                sx={{
                  fontWeight: "bold",
                }}
              >
                Average
                <MoreInfo text="The average (mean) value of this column." />
              </Typography>
              <Typography variant="data-primary">
                {avg !== null && avg !== undefined ? (
                  <FloatNumber value={avg} />
                ) : (
                  "N/A"
                )}
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
            Quality
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
              <MoreInfo text="The ratio of null to non-null values in a column." />
            </Typography>
            <Box
              sx={{
                display: "flex",
              }}
            >
              <DonutChart
                data={[
                  { name: "Non-null values", value: nonNullCount || 0 },
                  { name: "Null values", value: nullCount || 0 },
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
                    <IntegerNumber value={nonNullCount || 0} />
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
                    <IntegerNumber value={nullCount || 0} />
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
                <MoreInfo text="The ratio of unique values to duplicate values in a column." />
              </Typography>
              <Box
                sx={{
                  display: "flex",
                }}
              >
                <DonutChart
                  data={[
                    { name: "Unique values", value: approxUnique || 0 },
                    { name: "Duplicate values", value: duplicateCount || 0 },
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
                      <IntegerNumber value={approxUnique} />
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
                      <IntegerNumber value={duplicateCount} />
                    </Typography>
                  </Stack>
                </Box>
              </Box>
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>
      <Divider />
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        justifyContent={"space-between"}
        sx={{ my: 2 }}
      >
        <Typography variant="subsection-title" color="text.primary">
          Values
        </Typography>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="view-select-label">Group by</InputLabel>
          <Select
            labelId="view-select-label"
            id="view-select"
            value={view}
            label="Group by"
            onChange={(e) => setView(e.target.value)}
          >
            <MenuItem value={VALUE_COUNTS_VIEW}>Unique values</MenuItem>
            <MenuItem value={STRING_LENGTH_VIEW}>Value length</MenuItem>
          </Select>
        </FormControl>
      </Stack>
      <Box
        className="value-view-container"
        sx={{ flexGrow: 1, overflow: "hidden" }}
      >
        {view === VALUE_COUNTS_VIEW ? (
          <ColumnValueCounts id={id} barColor="#ccc" />
        ) : view === STRING_LENGTH_VIEW ? (
          <ColumnValueLengths id={id} barColor="#ccc" />
        ) : null}
      </Box>
    </Box>
  );
};

ColumnDetail.displayName = "ColumnDetail";

const EnhancedColumnDetail = withAssociatedAlerts(withColumnData(ColumnDetail));

EnhancedColumnDetail.displayName = "EnhancedColumnDetail";

export { EnhancedColumnDetail, ColumnDetail };
