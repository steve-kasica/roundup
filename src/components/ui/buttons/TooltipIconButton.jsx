/**
 * @fileoverview TooltipIconButton Component
 *
 * A reusable icon button component with integrated tooltip functionality. Provides
 * consistent tooltip behavior with click-to-close and configurable placement.
 *
 * Features:
 * - Integrated tooltip with customizable text
 * - Click to close tooltip
 * - Configurable arrow and placement
 * - Disabled state support
 * - Props forwarding to IconButton
 * - Automatic tooltip state management
 *
 * @module components/ui/buttons/TooltipIconButton
 *
 * @example
 * <TooltipIconButton
 *   tooltipText="Delete item"
 *   onClick={handleDelete}
 *   disabled={false}
 *   placement="bottom"
 *   arrow={true}
 * >
 *   <DeleteIcon />
 * </TooltipIconButton>
 */

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
        <IconButton
          onClick={handleClick}
          disabled={disabled}
          aria-label={tooltipText}
          {...props}
        >
          {children}
        </IconButton>
      </span>
    </Tooltip>
  );
};

export default TooltipIconButton;
