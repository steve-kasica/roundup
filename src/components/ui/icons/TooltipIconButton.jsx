/**
 * @fileoverview TooltipIconButton Component (Icons Directory)
 *
 * A reusable icon button with integrated tooltip functionality. Provides click-to-close
 * tooltip behavior and disabled state support. (Note: This appears to be a duplicate
 * of the button in ui/buttons directory.)
 *
 * Features:
 * - Integrated tooltip with customizable text
 * - Click to close tooltip
 * - Disabled state support
 * - Props forwarding to IconButton
 * - Automatic tooltip state management
 *
 * @module components/ui/icons/TooltipIconButton
 *
 * @example
 * <TooltipIconButton
 *   tooltipText="Delete"
 *   onClick={handleDelete}
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
