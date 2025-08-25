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

export default function MainContent() {
  const focusedOperation = useSelector((state) => {
    const id = selectFocusedOperationId(state);
    return selectOperation(state, id);
  });
  const resolution = useSelector((state) => state.ui.levelOfDetail);

  return (
    <Box sx={{ position: "relative", height: "100%" }}>
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
