import withColumnData from "./withColumnData";
import { Box, Divider, Typography } from "@mui/material";
import ColumnStats from "../ui/DescriptionList";
import ColumnValues from "./ColumnValues";
import ValueCounts from "./ValueCounts";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { useState } from "react";

const SingleColumn = withColumnData(
  ({ column, uniqueCount, duplicateCount, mode, nullCount, completeness }) => {
    const [view, setView] = useState("value counts");

    const handleViewChange = (event, newView) => {
      if (newView !== null) {
        setView(newView);
      }
    };
    return (
      <Box sx={{ p: 1 }}>
        <h2>{column.name}</h2>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
          Stats
        </Typography>
        <ColumnStats
          data={{
            null: nullCount,
            completeness: `${completeness * 100}%`,
            unique: uniqueCount,
            duplicate: duplicateCount,
            top: `${mode} (${column.values[mode] || 0})`,
          }}
        />
        <Divider sx={{ my: 2 }} />
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
        {view === "value counts" && (
          <ValueCounts
            columnId={column.id}
            tableId={column.tableId}
            uniqueCount={uniqueCount}
          />
        )}
        {view === "raw values" && (
          <ColumnValues columnId={column.id} tableId={column.tableId} />
        )}
      </Box>
    );
  }
);

export default SingleColumn;
