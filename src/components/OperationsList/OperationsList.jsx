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
import {
  isOperationId,
  selectAllOperationIds,
} from "../../slices/operationsSlice";
// import OperationView from "./OperationView";
import {
  Box,
  Divider,
  FormControl,
  FormHelperText,
  InputLabel,
  Select,
} from "@mui/material";
import { EnhancedOperationItem } from "./OperationItem";
import { useCallback, useMemo, useState } from "react";
import {
  selectFocusedObjectId,
  setFocusedObjectId,
} from "../../slices/uiSlice";
import { EnhancedOperationParams } from "./OperationParams/OperationParams";

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
  const operationIds = useSelector(selectAllOperationIds);
  const focusedObjectId = useSelector(selectFocusedObjectId);

  const reversedOperationIds = useMemo(
    () => [...operationIds].reverse(),
    [operationIds],
  );

  const handleChange = useCallback(
    (event) => {
      const operationId = event.target.value;
      dispatch(setFocusedObjectId(operationId));
    },
    [dispatch],
  );

  const renderValue = useCallback((value) => {
    if (!isOperationId(value)) {
      return "";
    }
    return <EnhancedOperationItem id={value} />;
  }, []);

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
      <FormControl fullWidth sx={{ mb: 1 }} size="small">
        <InputLabel id="operations-list-select">Operations</InputLabel>
        <Select
          labelId="operations-list-select"
          id="operations-select"
          value={
            focusedObjectId && isOperationId(focusedObjectId)
              ? focusedObjectId
              : ""
          }
          label="Operations"
          onChange={handleChange}
          renderValue={renderValue}
        >
          {reversedOperationIds.map((operationId) => (
            <div key={operationId}>
              <EnhancedOperationItem id={operationId} />
            </div>
          ))}
        </Select>
        <FormHelperText>
          Select an operation to focus and view details
        </FormHelperText>
      </FormControl>
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
