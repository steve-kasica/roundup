import { IconButton, Tooltip } from "@mui/material";
import { useState } from "react";

const TooltipIconButton = ({
  tooltipText,
  disabled,
  onClick,
  children,
  ...props
}) => {
  const [open, setOpen] = useState(false);

  const handleClick = (event) => {
    setOpen(false);
    if (typeof onClick === "function") {
      onClick(event);
    }
  };

  return (
    <Tooltip
      title={tooltipText}
      disableHoverListener={disabled}
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
    >
      <span>
        <IconButton onClick={handleClick} disabled={disabled} {...props}>
          {children}
        </IconButton>
      </span>
    </Tooltip>
  );
};

export default TooltipIconButton;
