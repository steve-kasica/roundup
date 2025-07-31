import PropTypes from "prop-types";
import {
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import withTableData from "../../HOC/withTableData";
import { descending } from "d3";
import { useSelector } from "react-redux";
import { selectColumnById } from "../../../slices/columnsSlice";
import { Icon, MoreVerticalIcon } from "lucide-react";

const colors = ["#e6550d", "#fdae6b", "#fee6ce"]; // Colors for high, medium, low uniqueness
const thresholds = [0.75, 0.5]; // Uniqueness ratio thresholds for color coding

function OperationKeyColumnSelect({
  table,
  columnIds,
  currentValue,
  onChange,
}) {
  const columns = useSelector((state) =>
    columnIds.map((id) => selectColumnById(state, id))
  );

  // Get the currently selected column for displaying its values
  const selectedColumn = useSelector((state) =>
    currentValue ? selectColumnById(state, currentValue) : null
  );

  const sortedColumns = [...columns].sort((a, b) =>
    descending(a.uniqueValues, b.uniqueValues)
  );

  const getUniquenessBadge = (column) => {
    const uniquenessRatio =
      column.uniqueValues && column.totalRows
        ? column.uniqueValues / column.totalRows
        : 0;

    const percentage = Math.round(uniquenessRatio * 100);
    const label = column.uniqueValues;

    let color = colors[2]; // Default to low
    if (uniquenessRatio > thresholds[0]) {
      color = colors[0]; // High
    } else if (uniquenessRatio > thresholds[1]) {
      color = colors[1]; // Medium
    }

    return (
      <Chip
        label={`${label}`}
        size="small"
        sx={{
          backgroundColor: color,
          color: percentage < 50 ? "#000" : "#fff",
          ml: 1,
          fontSize: "0.75rem",
        }}
      />
    );
  };

  // Get values from the selected column
  const getColumnValues = () => {
    if (!selectedColumn || !selectedColumn.values) {
      return [];
    }

    // Extract unique values and sort them by frequency (if available)
    const values = Object.entries(selectedColumn.values);
    return values.slice(0, 20); // Limit to first 20 values for display
  };

  // Get random sample of values for tooltip
  const getRandomValues = (column, count = 5) => {
    if (!column || !column.values) {
      return [];
    }

    const allValues = Object.keys(column.values);
    const shuffled = [...allValues].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, allValues.length));
  };

  const columnValues = getColumnValues();

  return (
    <Box>
      <FormControl fullWidth size="small">
        <InputLabel id={`key-select-label-${table.id}`}>
          {table.name}
        </InputLabel>
        <Select
          labelId={`key-select-label-${table.id}`}
          id={`key-select-${table.id}`}
          value={currentValue || ""}
          label={table.name}
          onChange={(event) => {
            const columnId = event.target.value;
            onChange(columnId);
          }}
        >
          <MenuItem value="">
            <em>No key column</em>
          </MenuItem>
          {sortedColumns.map((column) => {
            const randomValues = getRandomValues(column, 5);

            return (
              <MenuItem key={column.id} value={column.id}>
                <ListItem secondaryAction={getUniquenessBadge(column)}>
                  <ListItemText
                    primary={
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          width: "100%",
                        }}
                      >
                        <Typography>{column.name}</Typography>
                      </Box>
                    }
                    secondary={
                      randomValues.length > 0
                        ? randomValues.join(", ") + "..."
                        : "No sample values available"
                    }
                    slotProps={{
                      secondary: {
                        style: {
                          textOverflow: "ellipsis",
                          overflow: "hidden",
                          whiteSpace: "nowrap",
                          maxWidth: "300px",
                          fontSize: "0.75rem",
                        },
                      },
                    }}
                  />
                </ListItem>
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>

      {/* Display values from the currently selected column
      {selectedColumn && (
        <Paper sx={{ mt: 2, p: 2, maxHeight: 300, overflow: "auto" }}>
          {columnValues.length > 0 ? (
            <List dense sx={{ py: 0 }}>
              {columnValues.map(([value, count], index) => (
                <ListItem key={index} sx={{ py: 0.25, px: 1 }}>
                  <ListItemText
                    primary={
                      <Typography variant="body2" sx={{ fontSize: "0.85rem" }}>
                        {value === null || value === undefined
                          ? "(empty)"
                          : String(value)}
                      </Typography>
                    }
                    secondary={
                      count !== undefined
                        ? `Count: ${count}`
                        : "No count available"
                    }
                  />
                </ListItem>
              ))}
              {Object.keys(selectedColumn.values || {}).length > 20 && (
                <ListItem sx={{ py: 0.25, px: 1 }}>
                  <ListItemText
                    primary={
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: "0.85rem",
                          fontStyle: "italic",
                          color: "text.secondary",
                        }}
                      >
                        ... and {Object.keys(selectedColumn.values).length - 20}{" "}
                        more values
                      </Typography>
                    }
                  />
                </ListItem>
              )}
            </List>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No values available for this column
            </Typography>
          )}
        </Paper>
      )} */}
    </Box>
  );
}

OperationKeyColumnSelect.propTypes = {
  table: PropTypes.shape({
    name: PropTypes.string.isRequired,
    id: PropTypes.string,
  }).isRequired,
  columnIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  currentValue: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};

const EnhancedOperationKeyColumnSelect = withTableData(
  OperationKeyColumnSelect
);
export default EnhancedOperationKeyColumnSelect;
