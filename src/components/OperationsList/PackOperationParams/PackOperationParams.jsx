import {
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Divider,
} from "@mui/material";
import SwapIcon from "@mui/icons-material/SwapHoriz";
import { useState, useEffect } from "react";
import { JOIN_PREDICATES } from "../../../slices/operationsSlice";
import OperationKeyColumnSelect from "./OperationKeyColumnSelect";
import { withPackOperationData } from "../../HOC";

const PackOperationParams = ({
  operation,
  setJoinPredicate,
  setLeftTableJoinKey,
  setRightTableJoinKey,
  swapTablePositions,
  setJoinType,
}) => {
  const [selectedPredicate, setSelectedPredicate] = useState(
    operation.joinPredicate || ""
  );
  const [comparisonFunction, setComparisonFunction] = useState(null);

  // Dynamic import of comparison function based on predicate
  useEffect(() => {
    const loadComparisonFunction = async () => {
      if (!selectedPredicate) {
        // Default to equals if no predicate selected
        try {
          const module = await import("./comparisonFunctions");
          setComparisonFunction(() => module.equals);
        } catch (error) {
          console.error("Failed to load default comparison function:", error);
        }
        return;
      }

      try {
        const module = await import("./comparisonFunctions");

        let functionName;
        switch (selectedPredicate) {
          case JOIN_PREDICATES.EQUALS:
            functionName = "equals";
            break;
          case JOIN_PREDICATES.CONTAINS:
            functionName = "contains";
            break;
          case JOIN_PREDICATES.STARTS_WITH:
            functionName = "startsWith";
            break;
          case JOIN_PREDICATES.ENDS_WITH:
            functionName = "endsWith";
            break;
          default:
            functionName = "equals";
        }

        setComparisonFunction(() => module[functionName]);
      } catch (error) {
        console.error("Failed to load comparison function:", error);
        // Fallback to equals
        try {
          const module = await import("./comparisonFunctions");
          setComparisonFunction(() => module.equals);
        } catch (fallbackError) {
          console.error(
            "Failed to load fallback comparison function:",
            fallbackError
          );
        }
      }
    };

    loadComparisonFunction();
  }, [selectedPredicate]);

  const handlePredicateChange = (event) => {
    setSelectedPredicate(event.target.value);
    setJoinPredicate(event.target.value);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ display: "flex", alignItems: "flex-end", gap: 1, mb: 2 }}>
        <FormControl variant="standard" sx={{ flexGrow: 1 }}>
          <InputLabel id="pack-predicate-select-label">
            Match condition
          </InputLabel>
          <Select
            labelId="pack-predicate-select-label"
            value={selectedPredicate}
            label="MATCH CONDITION"
            onChange={handlePredicateChange}
          >
            <MenuItem value={JOIN_PREDICATES.EQUALS}>EQUALS</MenuItem>
            <MenuItem value={JOIN_PREDICATES.CONTAINS}>CONTAINS</MenuItem>
            <MenuItem value={JOIN_PREDICATES.STARTS_WITH}>STARTS WITH</MenuItem>
            <MenuItem value={JOIN_PREDICATES.ENDS_WITH}>ENDS WITH</MenuItem>
          </Select>
        </FormControl>
        <IconButton
          onClick={() => swapTablePositions()}
          color="primary"
          title="Swap table positions"
          sx={{ mb: 0.5 }}
        >
          <SwapIcon />
        </IconButton>
      </Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          flexWrap: "nowrap",
        }}
      >
        <OperationKeyColumnSelect
          id={operation.childIds[0]}
          currentValue={operation.joinKey1}
          onChange={setLeftTableJoinKey}
        />
        <Divider orientation="vertical" flexItem />
        <OperationKeyColumnSelect
          id={operation.childIds[1]}
          currentValue={operation.joinKey2}
          onChange={setRightTableJoinKey}
        />
      </Box>
      <Box sx={{ mt: 2 }}>
        {/* <PackOutputDetails
          leftTableId={operation.childIds[0]}
          rightTableId={operation.childIds[1]}
          leftColumnId={operation.joinKey1}
          rightColumnId={operation.joinKey2}
          joinType={operation.joinPredicate}
          joinPredicate={operation.joinPredicate}
          setJoinType={setJoinType}
        /> */}
      </Box>
    </Box>
  );
};

const EnhancedPackOperationParams = withPackOperationData(PackOperationParams);
export default EnhancedPackOperationParams;
