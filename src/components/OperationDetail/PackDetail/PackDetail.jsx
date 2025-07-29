import {
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
} from "@mui/material";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import withOperationData from "../../HOC/withOperationData";
import { useState, useEffect } from "react";
import { JOIN_PREDICATES } from "../../../slices/operationsSlice";
import OperationKeyColumnSelect from "./OperationKeyColumnSelect";
import CompareColumns from "./EffectsDetail/CompareColumns";

const PackDetail = ({
  operation,
  setJoinPredicate,
  setJoinKey1,
  setJoinKey2,
  swapTables,
}) => {
  const [selectedPredicate, setSelectedPredicate] = useState(
    operation.joinSpec?.joinPredicate || ""
  );
  const [comparisonFunction, setComparisonFunction] = useState(null);

  // Dynamic import of comparison function based on predicate
  useEffect(() => {
    const loadComparisonFunction = async () => {
      if (!selectedPredicate) {
        // Default to equals if no predicate selected
        try {
          const module = await import("./EffectsDetail/comparisonFunctions");
          setComparisonFunction(() => module.equals);
        } catch (error) {
          console.error("Failed to load default comparison function:", error);
        }
        return;
      }

      try {
        const module = await import("./EffectsDetail/comparisonFunctions");

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
          const module = await import("./EffectsDetail/comparisonFunctions");
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

  const handleSwapTables = () => {
    if (swapTables) {
      swapTables();
    }
  };

  const handleLeftKeyChange = (columnId) => {
    setJoinKey1(columnId);
  };

  const handleRightKeyChange = (columnId) => {
    setJoinKey2(columnId);
  };

  return (
    <Box sx={{ width: "500px", padding: 2 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <h1 style={{ margin: 0 }}>{operation.name}</h1>
        <IconButton
          onClick={handleSwapTables}
          color="primary"
          title="Swap table positions"
          sx={{ ml: 2 }}
        >
          <SwapHorizIcon />
        </IconButton>
      </Box>
      {/* <VennDiagram
        leftLabel={operation.children[0]}
        rightLabel={operation.children[1]}
        onJoinTypeChange={setJoinType}
        selectedJoinType={selectedOption}
      /> */}

      <div
        style={{ padding: "16px", backgroundColor: "#f9f9f9", width: "100%" }}
      >
        <h2>Effects Detail</h2>
        {/* <pre>{JSON.stringify(intersectionStats, null, 2)}</pre> */}
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
          <div style={{ flex: "1" }}>
            <OperationKeyColumnSelect
              id={operation.children[0]}
              currentValue={operation.joinSpec?.joinKey1}
              onChange={handleLeftKeyChange}
            />
          </div>
          <div style={{ flex: "1" }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="pack-predicate-select-label">
                JOIN PREDICATE
              </InputLabel>
              <Select
                labelId="pack-predicate-select-label"
                value={selectedPredicate}
                label="JOIN PREDICATE"
                onChange={handlePredicateChange}
              >
                <MenuItem value={JOIN_PREDICATES.EQUALS}>EQUALS</MenuItem>
                <MenuItem value={JOIN_PREDICATES.CONTAINS}>CONTAINS</MenuItem>
                <MenuItem value={JOIN_PREDICATES.STARTS_WITH}>
                  STARTS WITH
                </MenuItem>
                <MenuItem value={JOIN_PREDICATES.ENDS_WITH}>ENDS WITH</MenuItem>
              </Select>
            </FormControl>
          </div>
          <div style={{ flex: "1" }}>
            <OperationKeyColumnSelect
              id={operation.children[1]}
              currentValue={operation.joinSpec?.joinKey2}
              onChange={handleRightKeyChange}
            />
          </div>
        </div>
        <CompareColumns
          columnId1={operation.joinSpec?.joinKey1}
          columnId2={operation.joinSpec?.joinKey2}
          comparisonFunction={comparisonFunction}
        />
      </div>
    </Box>
  );
};

const EnhancedPackDetail = withOperationData(PackDetail);
export default EnhancedPackDetail;
