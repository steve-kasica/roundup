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
