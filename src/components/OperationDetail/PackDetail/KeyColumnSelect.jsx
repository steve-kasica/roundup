import PropTypes from "prop-types";
import {
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Chip,
} from "@mui/material";
import withTableData from "../../HOC/withTableData";
import { descending } from "d3";
import { useSelector } from "react-redux";
import { selectColumnById } from "../../../slices/columnsSlice";

const colors = ["#e6550d", "#fdae6b", "#fee6ce"]; // Colors for high, medium, low uniqueness
const thresholds = [0.75, 0.5]; // Uniqueness ratio thresholds for color coding
const labels = ["High", "Medium", "Low"];

function KeyColumnSelect({ table, columnIds, setKeyColumn }) {
  const columns = useSelector((state) =>
    columnIds.map((id) => selectColumnById(state, id))
  );

  const sortedColumns = [...columns].sort((a, b) =>
    descending(a.uniqueValues, b.uniqueValues)
  );

  // Get the current key column (assuming it's stored in table data)
  const currentKeyColumn = table.keyColumnId || "";

  const handleChange = (event) => {
    setKeyColumn(event.target.value);
  };

  const getUniquenessBadge = (column) => {
    const uniquenessRatio =
      column.uniqueValues && column.totalRows
        ? column.uniqueValues / column.totalRows
        : 0;

    const percentage = Math.round(uniquenessRatio * 100);

    let color = colors[2]; // Default to low
    if (uniquenessRatio > thresholds[0]) {
      color = colors[0]; // High
    } else if (uniquenessRatio > thresholds[1]) {
      color = colors[1]; // Medium
    }

    return (
      <Chip
        label={`${percentage}%`}
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

  return (
    <Box>
      <FormControl fullWidth size="small">
        <InputLabel id={`key-select-label-${table.id}`}>
          {table.name}
        </InputLabel>
        <Select
          labelId={`key-select-label-${table.id}`}
          id={`key-select-${table.id}`}
          value={currentKeyColumn}
          label="Select Key Column"
          onChange={handleChange}
        >
          <MenuItem value="">
            <em>No key column</em>
          </MenuItem>
          {sortedColumns.map((column) => (
            <MenuItem key={column.id} value={column.id}>
              <Box
                sx={{ display: "flex", alignItems: "center", width: "100%" }}
              >
                <Typography sx={{ flexGrow: 1 }}>{column.name}</Typography>
                {getUniquenessBadge(column)}
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}

KeyColumnSelect.propTypes = {
  table: PropTypes.shape({
    name: PropTypes.string.isRequired,
    id: PropTypes.string,
    keyColumnId: PropTypes.string,
  }).isRequired,
  columnIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  setKeyColumn: PropTypes.func.isRequired,
};

const EnhancedKeyColumnSelect = withTableData(KeyColumnSelect);
export default EnhancedKeyColumnSelect;
