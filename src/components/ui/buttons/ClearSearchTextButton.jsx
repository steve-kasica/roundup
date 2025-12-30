/**
 * @fileoverview ClearSearchTextButton Component
 *
 * A button for clearing search text input. Displays a clear (X) icon with tooltip
 * to reset search filters.
 *
 * Features:
 * - Clear icon (X)
 * - Customizable tooltip text
 * - Props forwarding to TooltipIconButton
 *
 * @module components/ui/buttons/ClearSearchTextButton
 *
 * @example
 * <ClearSearchTextButton
 *   onClick={handleClearSearch}
 *   tooltipText="Clear search"
 * />
 */

import { Clear } from "@mui/icons-material";
import TooltipIconButton from "./TooltipIconButton";

const ClearSearchTextButton = ({
  tooltipText = "Clear Search Text",
  ...props
}) => {
  return (
    <TooltipIconButton tooltipText={tooltipText} {...props}>
      <Clear />
    </TooltipIconButton>
  );
};

export default ClearSearchTextButton;
