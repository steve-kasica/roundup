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
