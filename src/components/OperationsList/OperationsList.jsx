/**
 * @fileoverview OperationsList Component
 *
 * Displays a list of all operations in the workspace in reverse chronological order
 * (most recent first). Each operation is rendered as an expandable accordion item
 * showing operation details and parameters.
 *
 * This component serves as the main operations panel in the application, allowing
 * users to view and manage all data transformation operations.
 *
 * @module components/OperationsList/OperationsList
 *
 * @example
 * <OperationsList />
 */

import { useDispatch, useSelector } from "react-redux";
import { isOperationId } from "../../slices/operationsSlice";
import { Box } from "@mui/material";
import {
  selectFocusedObjectId,
  setFocusedObjectId,
} from "../../slices/uiSlice";
import { EnhancedOperationParams } from "./OperationParams/OperationParams";
import OperationSelect from "./OperationSelect";
import { useCallback } from "react";

/**
 * OperationsList Component
 *
 * Renders all operations in reverse order (newest first).
 *
 * @component
 * @returns {React.ReactElement} A list of operation views
 *
 * @description
 * The component fetches all operation IDs from Redux and renders them
 * in reverse order to show the most recent operations first.
 */
export default function OperationsList() {
  const dispatch = useDispatch();
  const focusedObjectId = useSelector(selectFocusedObjectId);

  const handleSelectChange = useCallback(
    (value) => {
      dispatch(setFocusedObjectId(value));
    },
    [dispatch],
  );

  return (
    <Box
      className="OperationsList"
      display="flex"
      flexDirection="column"
      sx={{
        minWidth: 120,
        pt: 2,
        height: "100%",
        boxSizing: "border-box",
      }}
    >
      <OperationSelect
        focusedObjectId={focusedObjectId}
        onChange={handleSelectChange}
      />
      <Box
        flexGrow={1}
        sx={{
          padding: 1,
          border: "1px solid",
          borderColor: "divider",
          overflow: "auto",
          backgroundColor: "background.paper",
        }}
      >
        {focusedObjectId && isOperationId(focusedObjectId) && (
          <EnhancedOperationParams id={focusedObjectId} />
        )}
      </Box>
    </Box>
  );
}
