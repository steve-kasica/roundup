import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { Typography, MenuItem, Box, Chip, ListItemText } from "@mui/material";
import withTableData from "../../TableView/withTableData";
import { descending } from "d3";
import { useSelector } from "react-redux";
import { selectColumnsById } from "../../../slices/columnsSlice";

const colors = ["#e6550d", "#fdae6b", "#fee6ce"]; // Colors for high, medium, low uniqueness
const thresholds = [0.75, 0.5]; // Uniqueness ratio thresholds for color coding

function OperationKeyColumnSelect({
  table,
  activeColumnIds,
  currentValue,
  onChange,
}) {
  const columns = useSelector((state) =>
    activeColumnIds.map((id) => selectColumnsById(state, id))
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

  // Get a sample of values
  const getValues = (column, count = 5) => {
    if (!column || !column.values) {
      return [];
    }

    const allValues = Object.keys(column.values);
    return allValues.slice(0, Math.min(count, allValues.length));
  };

  const [selectedColumnId, setSelectedColumnId] = useState(currentValue || "");

  useEffect(() => {
    setSelectedColumnId(currentValue || "");
  }, [currentValue]);

  const handleClick = (columnId) => {
    setSelectedColumnId(columnId);
    onChange(columnId);
  };

  return (
    <Box
      sx={{
        display: "flex",
        width: "50%",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1,
          maxHeight: "150px",
          overflowY: "auto",
          position: "relative",
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            pl: 1,
            position: "sticky",
            top: 0,
            zIndex: 2,
            borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
            background: "rgb(245, 245, 245)",
            pt: 1,
            pb: 2,
          }}
        >
          {table.name}: {selectedColumnId}
        </Typography>
        {sortedColumns.map((column) => {
          const valueSample = getValues(column, 5);
          return (
            <MenuItem
              key={column.id}
              selected={selectedColumnId === column.id}
              onClick={() => handleClick(column.id)}
              sx={{ borderRadius: 1, mb: 0.5 }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  width: "100%",
                }}
              >
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
                      <Typography>
                        {column.name || column.columnName || column.id}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    valueSample.length > 0
                      ? valueSample.join(", ") + "..."
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
                {getUniquenessBadge(column)}
              </Box>
            </MenuItem>
          );
        })}
      </Box>
    </Box>
  );
}

OperationKeyColumnSelect.propTypes = {
  table: PropTypes.shape({
    name: PropTypes.string.isRequired,
    id: PropTypes.string,
  }).isRequired,
  activeColumnIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  currentValue: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};

const EnhancedOperationKeyColumnSelect = withTableData(
  OperationKeyColumnSelect
);
export default EnhancedOperationKeyColumnSelect;
