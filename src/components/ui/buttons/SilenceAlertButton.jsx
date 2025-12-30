/**
 * @fileoverview SilenceAlertButton Component
 *
 * A button for silencing/dismissing alerts. Displays select all or deselect icons
 * based on selection state (appears to be duplicated from SelectToggleIconButton).
 *
 * Features:
 * - Toggle between select all and deselect icons
 * - State-based icon rendering
 * - Automatic tooltip text based on state
 * - Props forwarding to TooltipIconButton
 *
 * @module components/ui/buttons/SilenceAlertButton
 *
 * @example
 * <SilenceAlertsButton
 *   isSelected={false}
 *   onClick={handleSilence}
 * />
 */

/* eslint-disable react/prop-types */
import { Deselect, SelectAll } from "@mui/icons-material";
import TooltipIconButton from "./TooltipIconButton";

const SilenceAlertsButton = ({ isSelected, ...props }) => {
  return (
    <>
      {!isSelected ? (
        <TooltipIconButton tooltipText="Select all" {...props}>
          <SelectAll />
        </TooltipIconButton>
      ) : (
        <TooltipIconButton tooltipText="Deselect all" {...props}>
          <Deselect />
        </TooltipIconButton>
      )}
    </>
  );
};
export default SilenceAlertsButton;
