import { Box, ToggleButton, ToggleButtonGroup, Tooltip } from "@mui/material";
import { useState } from "react";
import {
  OPERATION_TYPE_STACK,
  OPERATION_TYPE_PACK,
  selectFocusedOperationId,
  selectOperation,
} from "../../slices/operationsSlice";
import { useSelector } from "react-redux";
import StackOperationView from "../../components/StackOperationView";

// Resolution constants
const RESOLUTION_HIGH = "high";
const RESOLUTION_LOW = "low";

// Default resolution
const DEFAULT_RESOLUTION = RESOLUTION_LOW;

export default function MainContent() {
  const [resolution, setResolution] = useState(DEFAULT_RESOLUTION);
  const focusedOperation = useSelector((state) => {
    const id = selectFocusedOperationId(state);
    return selectOperation(state, id);
  });

  return (
    <Box sx={{ position: "relative", height: "100%" }}>
      <ToggleButtonGroup
        value={resolution}
        exclusive
        onChange={(event, newResolution) => {
          setResolution(newResolution);
        }}
        aria-label="table resolution"
        size="small"
        sx={{
          position: "absolute",
          top: 0,
          right: 0,
          zIndex: 10,
        }}
      >
        <ToggleButton value={RESOLUTION_LOW} aria-label="low resolution">
          <Tooltip title="Low Resolution">Low</Tooltip>
        </ToggleButton>
        <ToggleButton value={RESOLUTION_HIGH} aria-label="high resolution">
          <Tooltip title="High Resolution">High</Tooltip>
        </ToggleButton>
      </ToggleButtonGroup>
      <Box sx={{ padding: 2 }}>
        {focusedOperation?.operationType === OPERATION_TYPE_STACK && (
          <StackOperationView
            resolution={resolution}
            id={focusedOperation.id}
          />
        )}
      </Box>
    </Box>
  );
}
