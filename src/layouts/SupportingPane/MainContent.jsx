import { Box, ToggleButton, ToggleButtonGroup, Tooltip } from "@mui/material";
import { useState } from "react";
import { useSelector } from "react-redux";
import { selectRootOperation } from "../../slices/operationsSlice";
import LowLevelTable from "../../components/LowLevelTable";
import HighLevelTable from "../../components/HighLevelTable";

// Resolution constants
const RESOLUTION_HIGH = "high";
const RESOLUTION_MEDIUM = "medium";
const RESOLUTION_LOW = "low";

// Default resolution
const DEFAULT_RESOLUTION = RESOLUTION_LOW;

export default function MainContent() {
  const [resolution, setResolution] = useState(DEFAULT_RESOLUTION);
  //   const rootOperation = useSelector((state) => state.operations.data[selectRootOperation(state)]);
  console.log("MainContent rendered with resolution:", resolution);

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
          <Tooltip title="Low Resolution">1</Tooltip>
        </ToggleButton>
        <ToggleButton value={RESOLUTION_MEDIUM} aria-label="medium resolution">
          <Tooltip title="Medium Resolution">2</Tooltip>
        </ToggleButton>
        <ToggleButton value={RESOLUTION_HIGH} aria-label="high resolution">
          <Tooltip title="High Resolution">3</Tooltip>
        </ToggleButton>
      </ToggleButtonGroup>
      {resolution === RESOLUTION_HIGH && (
        <Box sx={{ padding: 2 }}>
          <HighLevelTable />
        </Box>
      )}
      {resolution === RESOLUTION_MEDIUM && (
        <Box sx={{ padding: 2 }}>
          <h2>Medium Resolution Content</h2>
          {/* Render medium resolution content here */}
        </Box>
      )}
      {resolution === RESOLUTION_LOW && (
        <Box sx={{ padding: 2 }}>
          <LowLevelTable />
          {/* Render low resolution content here */}
        </Box>
      )}
    </Box>
  );
}
