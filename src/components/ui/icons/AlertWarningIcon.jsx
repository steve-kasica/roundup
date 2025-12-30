/**
 * @fileoverview AlertWarningIcon Component
 *
 * A warning alert icon component with tooltip. Displays a warning icon in
 * warning color to indicate potential issues or warnings.
 *
 * Features:
 * - Warning amber outlined icon from MUI
 * - Warning color from theme
 * - Tooltip with customizable text
 * - Arrow indicator on tooltip
 *
 * @module components/ui/icons/AlertWarningIcon
 *
 * @example
 * <AlertWarningIcon tooltip="Missing values detected" />
 */

import React from "react";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import Tooltip from "@mui/material/Tooltip";
import { WarningAmberOutlined } from "@mui/icons-material";

const AlertWarningIcon = ({ tooltip = "An warning occurred" }) => (
  <Tooltip title={tooltip} arrow>
    <WarningAmberOutlined
      sx={{
        color: "warning.main",
      }}
    />
  </Tooltip>
);

export default AlertWarningIcon;
