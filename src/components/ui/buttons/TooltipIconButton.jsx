import { IconButton, Tooltip } from "@mui/material";
import { useState } from "react";

const TooltipIconButton = ({
  tooltipText,
  disabled,
  onClick,
  children,
  arrow = true,
  placement = "top",
  ...props
}) => {
  const [open, setOpen] = useState(false);

  const handleClick = (event) => {
    setOpen(false);
    onClick(event);
  };

  return (
    <Tooltip
      title={`${tooltipText} ${disabled ? "(disabled)" : ""}`}
      arrow={arrow}
      placement={placement}
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
