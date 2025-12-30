/**
 * @fileoverview AlertErrorIcon Component
 *
 * An error alert icon component with tooltip. Displays an error outline icon
 * in error color to indicate critical issues or errors.
 *
 * Features:
 * - Error outline icon from MUI
 * - Error color from theme
 * - Tooltip with customizable text
 * - Arrow indicator on tooltip
 *
 * @module components/ui/icons/AlertErrorIcon
 *
 * @example
 * <AlertErrorIcon tooltip="Invalid column type" />
 */

import React from "react";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import Tooltip from "@mui/material/Tooltip";

const AlertErrorIcon = ({ tooltip = "An error occurred" }) => (
  <Tooltip title={tooltip} arrow>
    <ErrorOutlineIcon
      sx={{
        color: "error.main",
      }}
    />
  </Tooltip>
);

export default AlertErrorIcon;
