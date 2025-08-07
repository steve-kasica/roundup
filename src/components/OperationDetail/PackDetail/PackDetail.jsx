import {
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
} from "@mui/material";
import SwapIcon from "@mui/icons-material/SwapVert";
import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { JOIN_PREDICATES } from "../../../slices/operationsSlice";
import OperationKeyColumnSelect from "./OperationKeyColumnSelect";
import EditableText from "../../ui/EditableText";
import withPackOperationData from "./withPackOperationData";
import PackOutputDetails from "./PackOutputDetails";

const PackDetail = ({
  operation,
  setJoinPredicate,
  setLeftTableJoinKey,
  setRightTableJoinKey,
  swapTablePositions,
  renameOperation,
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
          const module = await import(
            "./PackOutputDetails/comparisonFunctions"
          );
          setComparisonFunction(() => module.equals);
        } catch (error) {
          console.error("Failed to load default comparison function:", error);
        }
        return;
      }

      try {
        const module = await import("./PackOutputDetails/comparisonFunctions");

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
          const module = await import(
            "./PackOutputDetails/comparisonFunctions"
          );
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
    <Box sx={{ width: "500px", padding: 2 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <EditableText
          initialValue={operation.name}
          onChange={renameOperation}
          placeholder="Operation name"
        />
      </Box>

      <div style={{ width: "100%" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: "1" }}>
            <OperationKeyColumnSelect
              id={operation.children[0]}
              currentValue={operation.joinKey1}
              onChange={(columnId) => setLeftTableJoinKey(columnId)}
            />
          </div>
          <div style={{ flex: "1" }}>
            <Box
              sx={{ display: "flex", alignItems: "flex-end", gap: 1, mb: 2 }}
            >
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
                  <MenuItem value={JOIN_PREDICATES.STARTS_WITH}>
                    STARTS WITH
                  </MenuItem>
                  <MenuItem value={JOIN_PREDICATES.ENDS_WITH}>
                    ENDS WITH
                  </MenuItem>
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
          </div>
          <div style={{ flex: "1" }}>
            <OperationKeyColumnSelect
              id={operation.children[1]}
              currentValue={operation.joinKey2}
              onChange={(columnId) => setRightTableJoinKey(columnId)}
            />
          </div>
        </div>
        <PackOutputDetails
          leftTableId={operation.children[0]}
          rightTableId={operation.children[1]}
          leftColumnId={operation.joinKey1}
          rightColumnId={operation.joinKey2}
          joinType={operation.joinPredicate}
          joinPredicate={operation.joinPredicate}
          setJoinType={setJoinType}
        />
      </div>
    </Box>
  );
};

PackDetail.propTypes = {
  operation: PropTypes.shape({
    name: PropTypes.string,
    children: PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    ),
    joinPredicate: PropTypes.string,
    joinKey1: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    joinKey2: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
  setJoinPredicate: PropTypes.func.isRequired,
  setLeftTableJoinKey: PropTypes.func.isRequired,
  setRightTableJoinKey: PropTypes.func.isRequired,
  swapTablePositions: PropTypes.func.isRequired,
  renameOperation: PropTypes.func.isRequired,
  setJoinType: PropTypes.func.isRequired,
};

const EnhancedPackDetail = withPackOperationData(PackDetail);
export default EnhancedPackDetail;
