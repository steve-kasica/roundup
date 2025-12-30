/**
 * @fileoverview HideIconButton Component
 *
 * A button for hiding columns. Displays a visibility-off icon to hide selected
 * or specified columns from view.
 *
 * Features:
 * - Visibility off icon
 * - Customizable tooltip text
 * - Props forwarding to TooltipIconButton
 *
 * @module components/ui/buttons/HideIconButton
 *
 * @example
 * <HideIconButton
 *   onClick={handleHide}
 *   tooltipText="Hide columns"
 * />
 */

import { VisibilityOff } from "@mui/icons-material";
import TooltipIconButton from "./TooltipIconButton";

const HideIconButton = ({ tooltipText = "Hide columns", ...props }) => (
  <TooltipIconButton tooltipText={tooltipText} {...props}>
    <VisibilityOff />
  </TooltipIconButton>
);

export default HideIconButton;
