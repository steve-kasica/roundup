/* eslint-disable react/prop-types */
import { IconButton } from "@mui/material";
import { Deselect, SelectAll } from "@mui/icons-material";
const SelectToggleIconButton = ({ isSelected, onClick }) => {
  return (
    <>
      {!isSelected ? (
        <IconButton size="small" onClick={onClick} title="Select all">
          <SelectAll fontSize="small" />
        </IconButton>
      ) : (
        <IconButton size="small" onClick={onClick} title="Deselect all">
          <Deselect fontSize="small" />
        </IconButton>
      )}
    </>
  );
};
export default SelectToggleIconButton;
