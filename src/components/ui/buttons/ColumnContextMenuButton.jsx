/**
 * @fileoverview ColumnContextMenuButton Component
 *
 * A button for opening a context menu with single column actions. Displays a
 * horizontal ellipsis icon (more options) with tooltip.
 *
 * Features:
 * - More options icon (horizontal ellipsis)
 * - Customizable tooltip text
 * - Props forwarding to TooltipIconButton
 *
 * @module components/ui/buttons/ColumnContextMenuButton
 *
 * @example
 * <ColumnContextMenuButton
 *   onClick={handleOpenMenu}
 *   tooltipText="Column actions"
 * />
 */

import { MoreHoriz as Icon } from "@mui/icons-material";
import TooltipIconButton from "./TooltipIconButton";

const ColumnContextMenuButton = ({
  tooltipText = "Single column actions",
  ...props
}) => {
  return (
    <TooltipIconButton tooltipText={tooltipText} {...props}>
      <Icon />
    </TooltipIconButton>
  );
};

export default ColumnContextMenuButton;
