/**
 * @fileoverview MaterializeViewIconButton Component
 *
 * A specialized icon button for triggering view materialization in DuckDB. Displays
 * a refresh icon with tooltip explaining the materialization action for performance
 * optimization.
 *
 * Features:
 * - Refresh icon representation
 * - Descriptive tooltip
 * - Secondary color styling
 * - Small size for compact display
 * - Props forwarding for flexibility
 *
 * @module components/ui/MaterializeViewIconButton
 *
 * @example
 * <MaterializeViewIconButton onClick={handleMaterialize} />
 */

import { IconButton } from "@mui/material";
import { Refresh as MaterializeViewIcon } from "@mui/icons-material";

const MaterializeViewIconButton = (props) => (
  <IconButton
    size="small"
    {...props}
    title="Materialize view for better performance"
    aria-label="Materialize view for better performance"
    color="secondary"
  >
    <MaterializeViewIcon fontSize="small" />
  </IconButton>
);

export default MaterializeViewIconButton;
