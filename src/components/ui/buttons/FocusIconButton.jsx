/**
 * @fileoverview FocusIconButton Component
 *
 * A button for focusing selected columns. Displays a center focus icon to
 * bring selected columns into detail view.
 *
 * Features:
 * - Center focus icon
 * - Customizable tooltip text
 * - Small icon size
 * - Props forwarding to TooltipIconButton
 *
 * @module components/ui/buttons/FocusIconButton
 *
 * @example
 * <FocusIconButton
 *   onClick={handleFocus}
 *   tooltipText="Focus 2 columns"
 * />
 */

import { CenterFocusStrong } from "@mui/icons-material";
import TooltipIconButton from "./TooltipIconButton";

const FocusIconButton = ({
  tooltipText = "Focus selected columns",
  ...props
}) => {
  return (
    <TooltipIconButton tooltipText={tooltipText} {...props}>
      <CenterFocusStrong fontSize="small" />
    </TooltipIconButton>
  );
};

export default FocusIconButton;
