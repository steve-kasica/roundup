import { Box, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import withOperationData from "../../HOC/withOperationData";
import { isTableId } from "../../../slices/tablesSlice";
import TableView from "./TableView";
import { useState } from "react";
import { JOIN_TYPES } from "../../../slices/operationsSlice";

const PackDetail = ({ operation, setJoinType, setJoinKey1, setJoinKey2 }) => {
  const [selectedOption, setSelectedOption] = useState(
    operation.joinType || ""
  );

  const handleSelectChange = (event) => {
    setSelectedOption(event.target.value);
    setJoinType(event.target.value);
  };

  return (
    <Box sx={{ width: "300px", padding: 2 }}>
      <h1>{operation.name}</h1>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="pack-detail-select-label">JOIN TYPE</InputLabel>
        <Select
          labelId="pack-detail-select-label"
          value={selectedOption}
          label="JOIN TYPE"
          onChange={handleSelectChange}
        >
          <MenuItem value={JOIN_TYPES.INNER}>INNER</MenuItem>
          <MenuItem value={JOIN_TYPES.LEFT}>LEFT</MenuItem>
          <MenuItem value={JOIN_TYPES.RIGHT}>RIGHT</MenuItem>
        </Select>
      </FormControl>

      <Box sx={{ display: "flex", gap: 2 }}>
        {operation.children.map((childId, i) =>
          isTableId(childId) ? (
            <Box key={childId} sx={{ flex: 1 }}>
              <TableView
                id={childId}
                onChange={(event) => {
                  if (i === 0) {
                    setJoinKey1(event.target.value);
                  } else {
                    setJoinKey2(event.target.value);
                  }
                }}
              />
            </Box>
          ) : null
        )}
      </Box>
    </Box>
  );
};

const EnhancedPackDetail = withOperationData(PackDetail);
export default EnhancedPackDetail;
