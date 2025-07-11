import { useState } from "react";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import withTableData from "../../HOC/withTableData";
import ColumnView from "./ColumnView";

function TableView({ table, columnIds, onChange }) {
  const [selectedColumnId, setSelectedColumnId] = useState(columnIds[0] || "");

  const handleChange = (event) => {
    setSelectedColumnId(event.target.value);
    onChange(event);
  };

  return (
    <FormControl fullWidth variant="outlined" sx={{ minWidth: 120 }}>
      <InputLabel id={`${table.id}-view-label`}>{table.name}</InputLabel>
      <Select
        labelId={`${table.id}-view-label`}
        id={table.id}
        value={selectedColumnId}
        label={table.name}
        onChange={handleChange}
      >
        {columnIds.map((columnId) => (
          <MenuItem key={columnId} value={columnId}>
            <ColumnView id={columnId} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

const EnhancedTableView = withTableData(TableView);
export default EnhancedTableView;
