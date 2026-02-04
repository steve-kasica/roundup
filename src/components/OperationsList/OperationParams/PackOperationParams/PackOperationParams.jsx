import {
  Box,
  Button,
  MenuItem,
  Typography,
  TextField,
  FormControl,
  Select,
  InputLabel,
  FormControlLabel,
  ToggleButton,
  ToggleButtonGroup,
  Radio,
  RadioGroup,
  Stack,
} from "@mui/material";
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useDispatch } from "react-redux";
import { withPackOperationData } from "../../../HOC";
import { EnhancedTableLabel } from "../../../TableView";
import { isTableId } from "../../../../slices/tablesSlice";
import { EnhancedOperationLabel } from "../../../OperationView/OperationLabel";
import JoinColumnsSelect from "./JoinColumnsSelect";
import { JoinInner, JoinLeft, JoinRight } from "@mui/icons-material";
import JoinPredicateSelect from "./JoinPredicateSelect";
import JoinSummary from "./JoinSummary";
import { updateOperationsRequest } from "../../../../sagas/updateOperationsSaga";
import TableOrderRadio from "./TableOrderRadio";
// import PackOutputDetails from "./PackOutputDetails";

const PackOperationParams = ({
  // Props passed via withPackOperationData HOC
  id,
  name,
  leftTableId,
  leftColumnIds = [],
  rightColumnIds = [],
  rightTableId,
  leftKey,
  rightKey,
  setJoinPredicate,
  joinPredicate,
  setLeftTableJoinKey,
  setRightTableJoinKey,
}) => {
  const dispatch = useDispatch();
  const [nameLocal, setNameLocal] = useState(name || "Op.");
  const [inputValue, setInputValue] = useState(name || "Op.");
  const debounceTimerRef = useRef(null);

  const [leftTableIdLocal, setLeftTableIdLocal] = useState(leftTableId);
  const [rightTableIdLocal, setRightTableIdLocal] = useState(rightTableId);
  const [leftColumnKeyIdLocal, setLeftColumnKeyIdLocal] = useState(leftKey);
  const [rightColumnKeyIdLocal, setRightColumnKeyIdLocal] = useState(rightKey);
  const [joinPredicateState, setJoinPredicateState] = useState(joinPredicate);

  // Sync local state with props when operation changes
  useEffect(() => {
    setLeftTableIdLocal(leftTableId);
    setRightTableIdLocal(rightTableId);
    setLeftColumnKeyIdLocal(leftKey);
    setRightColumnKeyIdLocal(rightKey);
    setJoinPredicateState(joinPredicate);
    setNameLocal(name || "Op.");
    setInputValue(name || "Op.");
  }, [id, leftTableId, rightTableId, leftKey, rightKey, joinPredicate, name]);

  const hasChanges = useMemo(() => {
    return (
      nameLocal !== (name || "Op.") ||
      leftColumnKeyIdLocal !== leftKey ||
      rightColumnKeyIdLocal !== rightKey ||
      joinPredicateState !== joinPredicate ||
      leftTableIdLocal !== leftTableId ||
      rightTableIdLocal !== rightTableId
    );
  }, [
    leftTableId,
    rightTableId,
    nameLocal,
    name,
    leftColumnKeyIdLocal,
    leftKey,
    rightColumnKeyIdLocal,
    rightKey,
    joinPredicateState,
    joinPredicate,
    leftTableIdLocal,
    rightTableIdLocal,
  ]);

  const handleNameChange = useCallback((e) => {
    const value = e.target.value;
    setInputValue(value);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setNameLocal(value);
    }, 300);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleUpdate = useCallback(
    (e) => {
      e.preventDefault();
      const localChildIds = [leftTableIdLocal, rightTableIdLocal];

      const formData = {
        id,
        name: nameLocal,
        childIds: localChildIds,
        joinKey1: leftColumnKeyIdLocal,
        joinKey2: rightColumnKeyIdLocal,
        joinPredicate: joinPredicateState,
        matchStats: {}, // will be set in updateOperationsSaga/worker
      };

      dispatch(updateOperationsRequest([formData]));
    },
    [
      leftTableIdLocal,
      rightTableIdLocal,
      id,
      nameLocal,
      leftColumnKeyIdLocal,
      rightColumnKeyIdLocal,
      joinPredicateState,
      dispatch,
    ],
  );

  const handleJoinColumnsSelectChange = useCallback((leftKeyId, rightKeyId) => {
    setLeftColumnKeyIdLocal(leftKeyId);
    setRightColumnKeyIdLocal(rightKeyId);
  }, []);

  const handleTableOrderChange = useCallback((left, right) => {
    setLeftTableIdLocal(left);
    setRightTableIdLocal(right);
  }, []);

  return (
    <Box
      className="PackOperationParams"
      component={"form"}
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: 2,
        height: "100%",
      }}
    >
      <Box flexGrow={1} overflow={"auto"}>
        {/* <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
          Metadata
        </Typography>
        <FormControl fullWidth sx={{ mb: 2 }} size="small">
          <TextField
            id="operation-name"
            label="Name"
            variant="outlined"
            size="small"
            value={inputValue}
            onChange={handleNameChange}
          />
        </FormControl> */}
        <Typography variant="h5" gutterBottom sx={{ my: 1 }}>
          Join parameters
        </Typography>
        {/* <JoinSummary joinPredicate={joinPredicate} /> */}
        <TableOrderRadio
          childIds={[leftTableIdLocal, rightTableIdLocal]}
          onChange={handleTableOrderChange}
        />

        <JoinColumnsSelect
          leftTableId={leftTableIdLocal}
          rightTableId={rightTableIdLocal}
          leftColumnIds={
            leftTableIdLocal === leftTableId ? leftColumnIds : rightColumnIds
          }
          rightColumnIds={
            rightTableIdLocal === rightTableId ? rightColumnIds : leftColumnIds
          }
          leftKeyId={
            leftTableIdLocal === leftTableId
              ? leftColumnKeyIdLocal
              : rightColumnKeyIdLocal
          }
          rightKeyId={
            rightTableIdLocal === rightTableId
              ? rightColumnKeyIdLocal
              : leftColumnKeyIdLocal
          }
          onChange={handleJoinColumnsSelectChange}
          sx={{
            mb: 1,
          }}
        />
        <JoinPredicateSelect
          value={joinPredicateState}
          onChange={(newPredicate) => {
            setJoinPredicateState(newPredicate);
          }}
          sx={{
            mb: 1,
          }}
        />
        {/* <Typography variant="h5" gutterBottom sx={{ my: 2 }}>
          Output options
        </Typography>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel
            shrink
            sx={{ position: "relative", transform: "none", mb: 1 }}
          >
            Include rows from:
          </InputLabel>
          <ToggleButtonGroup size="small">
            <ToggleButton value="left">
              <JoinLeft sx={{ mr: 1 }} />
              Left table
            </ToggleButton>
            <ToggleButton value="inner">
              <JoinInner sx={{ mr: 1 }} />
              Both tables
            </ToggleButton>
            <ToggleButton value="right">
              <JoinRight sx={{ mr: 1 }} />
              Right table
            </ToggleButton>
          </ToggleButtonGroup>
        </FormControl> */}
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          mt: 3,
          pt: 2,
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        {/* <Button variant="outlined" color="error">
          Delete operation
        </Button> */}
        <Button
          variant="contained"
          color="primary"
          onClick={handleUpdate}
          disabled={!hasChanges}
        >
          Update
        </Button>
      </Box>
    </Box>
  );
};

const EnhancedPackOperationParams = withPackOperationData(
  withPackOperationData(PackOperationParams),
);
export { EnhancedPackOperationParams, PackOperationParams };
