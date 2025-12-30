/**
 * @fileoverview SelectToggleIconButton Component
 *
 * A button for toggling selection state (select all/deselect all). Displays
 * appropriate icon based on current selection state.
 *
 * Features:
 * - Toggle between select all and deselect icons
 * - State-based icon rendering
 * - Automatic tooltip text based on state
 * - Props forwarding to TooltipIconButton
 *
 * @module components/ui/buttons/SelectToggleIconButton
 *
 * @example
 * <SelectToggleIconButton
 *   isSelected={true}
 *   onClick={handleToggleSelect}
 * />
 */

/* eslint-disable react/prop-types */
import { Deselect, SelectAll } from "@mui/icons-material";
import TooltipIconButton from "./TooltipIconButton";

const SelectToggleIconButton = ({ isSelected, ...props }) => {
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
export default SelectToggleIconButton;
