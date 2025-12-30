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

import { useSelector } from "react-redux";
import { selectAllOperationIds } from "../../slices/operationsSlice";
import OperationView from "./OperationView";

import "./OperationsList.scss";
import { Box } from "@mui/material";

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
  const operationIds = useSelector(selectAllOperationIds);

  const reveredOperationIds = [...operationIds].reverse();

  return (
    <Box>
      {reveredOperationIds.map((operationId, i) => (
        <OperationView key={operationId} id={operationId} index={i} />
      ))}
    </Box>
  );
}
