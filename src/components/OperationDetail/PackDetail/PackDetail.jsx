import { Box, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import withOperationData from "../../HOC/withOperationData";
import { isTableId } from "../../../slices/tablesSlice";
import TableView from "./TableView";
import { useState } from "react";
import { JOIN_TYPES, JOIN_PREDICATES } from "../../../slices/operationsSlice";

const PackDetail = ({
  operation,
  setJoinType,
  setJoinKey1,
  setJoinKey2,
  setJoinPredicate,
}) => {
  const [selectedOption, setSelectedOption] = useState(
    operation.joinType || ""
  );
  const [selectedPredicate, setSelectedPredicate] = useState(
    operation.joinSpec?.joinPredicate || ""
  );

  const handleSelectChange = (event) => {
    setSelectedOption(event.target.value);
    setJoinType(event.target.value);
  };

  const handlePredicateChange = (event) => {
    setSelectedPredicate(event.target.value);
    setJoinPredicate(event.target.value);
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

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="pack-predicate-select-label">JOIN PREDICATE</InputLabel>
        <Select
          labelId="pack-predicate-select-label"
          value={selectedPredicate}
          label="JOIN PREDICATE"
          onChange={handlePredicateChange}
        >
          <MenuItem value={JOIN_PREDICATES.EQUALS}>EQUALS</MenuItem>
          <MenuItem value={JOIN_PREDICATES.CONTAINS}>CONTAINS</MenuItem>
          <MenuItem value={JOIN_PREDICATES.STARTS_WITH}>STARTS WITH</MenuItem>
          <MenuItem value={JOIN_PREDICATES.ENDS_WITH}>ENDS WITH</MenuItem>
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
