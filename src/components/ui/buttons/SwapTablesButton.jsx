/**
 * @fileoverview SwapTablesButton Component
 *
 * A button for swapping table positions in PACK operations. Displays a swap
 * horizontal icon to exchange left and right tables in a join.
 *
 * Features:
 * - Swap horizontal icon
 * - Customizable tooltip text
 * - Props forwarding to TooltipIconButton
 *
 * @module components/ui/buttons/SwapTablesButton
 *
 * @example
 * <SwapTablesButton
 *   onClick={handleSwap}
 *   tooltipText="Swap tables"
 * />
 */

import { SwapHoriz as Icon } from "@mui/icons-material";
import TooltipIconButton from "./TooltipIconButton";

const SwapTablesButton = ({
  tooltipText = "Swap table positions",
  ...props
}) => {
  return (
    <TooltipIconButton tooltipText={tooltipText} {...props}>
      <Icon />
    </TooltipIconButton>
  );
};

export default SwapTablesButton;
