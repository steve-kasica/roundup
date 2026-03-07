/**
 * @fileoverview CompositeTableSchema Component
 *
 * This component serves as the main entry point for the module. It renders the
 * hierarchical schema visualization, including drop targets for adding tables
 * via STACK or PACK operations.
 *
 * @module components/CompositeTableSchema/CompositeTableSchema
 *
 * @description
 * Layout structure:
 * - Left/main area: Operation blocks showing the current schema hierarchy
 * - Bottom drop zone: Add tables via STACK operation (vertical union)
 * - Right drop zone: Add tables via PACK operation (horizontal join)
 * - Center drop zone: Initial drop zone when no tables exist (NO_OP)
 *
 * Operation constraints:
 * - Adding operations is disabled when:
 *   - Root operation is not materialized
 *   - Root operation is out of sync
 *   - There are existing errors in the schema
 *
 * Edge cases:
 * - Empty state (no children): Shows only the appropriate drop target
 * - Single table: Can evolve to STACK or PACK when another table is added
 * - Errors: Drop zones are disabled until errors are resolved
 *
 * @example
 * <CompositeTableSchema />
 */

import { useSelector } from "react-redux";
import {
  isOperationId,
  selectRootOperation,
} from "../../slices/operationsSlice";

import { Box, Typography } from "@mui/material";
import { EnhancedOperationBlock } from "./OperationBlock";
import { selectAlertErrorCount } from "../../slices/alertsSlice";
import { selectFocusedObjectId } from "../../slices/uiSlice";

/**
 * SchemaPlaceholder Component
 *
 * Renders a muted tree-map illustration of what the schema visualization looks
 * like when it has content, giving the user a visual hint before any tables are
 * loaded.
 *
 * @component
 * @returns {React.ReactElement}
 */
function SchemaPlaceholder() {
  const cellSx = {
    borderRadius: 0.5,
    bgcolor: "grey.300",
  };
  const outerSx = {
    border: "2px solid",
    borderColor: "grey.300",
    borderRadius: 1,
    p: 0.75,
    display: "flex",
    flexDirection: "column",
    gap: 0.75,
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      sx={{ height: "100%", width: "100%", position: "relative" }}
    >
      {/* Muted placeholder illustration */}
      <Box
        display="flex"
        flexDirection="column"
        sx={{
          position: "absolute",
          inset: 0,
          opacity: 0.25,
          userSelect: "none",
          p: 1,
        }}
      >
        {/* Outer container — root operation */}
        <Box sx={{ ...outerSx, flex: 1 }}>
          {/* Header row */}
          <Box sx={{ ...cellSx, height: 12, width: "60%" }} />

          {/* Nested grid: two child tables side by side */}
          <Box display="flex" flexDirection="row" gap={0.75} flex={1}>
            {/* Left child table */}
            <Box sx={{ ...outerSx, flex: 1 }}>
              <Box sx={{ ...cellSx, flex: 5, width: "100%", minHeight: 6 }} />
              <Box sx={{ ...cellSx, flex: 4, width: "100%", minHeight: 6 }} />
              <Box sx={{ ...cellSx, flex: 4, width: "100%", minHeight: 6 }} />
            </Box>

            {/* Right child table */}
            <Box sx={{ ...outerSx, flex: 1 }}>
              <Box sx={{ ...cellSx, flex: 5, width: "100%", minHeight: 6 }} />
              <Box sx={{ ...cellSx, flex: 4, minHeight: 6 }} />
              <Box sx={{ ...cellSx, flex: 4, width: "100%", minHeight: 6 }} />
            </Box>

            {/* Third child table */}
            <Box sx={{ ...outerSx, flex: 1 }}>
              <Box sx={{ ...cellSx, flex: 5, width: "100%", minHeight: 6 }} />
              <Box sx={{ ...cellSx, flex: 4, width: "100%", minHeight: 6 }} />
              <Box sx={{ ...cellSx, flex: 4, width: "100%", minHeight: 6 }} />
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Centered call-to-action text */}
      <Typography
        variant="h6"
        sx={{ fontWeight: 600, color: "text.secondary", zIndex: 1 }}
      >
        Add a table to begin
      </Typography>
    </Box>
  );
}

/**
 * CompositeTableSchema Component
 *
 * Renders the main schema visualization with drop targets for adding tables
 * through STACK or PACK operations.
 *
 * @component
 * @returns {React.ReactElement} The complete schema visualization with drop zones
 *
 */
export default function CompositeTableSchema() {
  const rootOperation = useSelector(selectRootOperation);

  return (
    <Box
      className="CompositeTableSchema"
      display="flex"
      flexDirection="column"
      sx={{ height: "100%" }}
    >
      {rootOperation ? (
        <Box display="flex" flexDirection="row" width="100%" flex={1}>
          <Box
            flexGrow={1}
            sx={{ height: "100%" }}
            display={"flex"}
            flexDirection={"column"}
          >
            {rootOperation.childIds.length > 0 ? (
              <EnhancedOperationBlock
                id={rootOperation.id}
                sx={{ height: "100%", flexGrow: 1 }}
              />
            ) : null}
          </Box>
        </Box>
      ) : (
        <SchemaPlaceholder />
      )}
    </Box>
  );
}
