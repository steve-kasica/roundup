/**
 * @fileoverview OperationName Component
 *
 * A simple text display component for rendering operation names with consistent
 * typography and styling. Integrates with the withOperationData HOC to access
 * operation metadata and provides a standardized name display across the application.
 *
 * Features:
 * - Typography-based name display
 * - Customizable sx prop for styling overrides
 * - Integration with operation data HOC
 * - Consistent text formatting
 *
 * @module components/OperationView/OperationName
 *
 * @example
 * <EnhancedOperationName id={operationId} sx={{ fontWeight: 'bold' }} />
 */

/* eslint-disable react/prop-types */
import { Typography } from "@mui/material";
import { withOperationData } from "../HOC";

const OperationName = ({ name, sx = {}, variant = "data-small" }) => {
  return (
    <Typography variant={variant} component="div" sx={sx}>
      {name}
    </Typography>
  );
};

OperationName.displayName = "OperationName";

const EnhancedOperationName = withOperationData(OperationName);

EnhancedOperationName.displayName = "EnhancedOperationName";

export { OperationName, EnhancedOperationName };
