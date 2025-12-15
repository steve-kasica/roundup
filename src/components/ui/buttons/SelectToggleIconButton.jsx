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
