import { useState } from "react";
import { Button, Menu, MenuItem } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import {
  isOperationId,
  JOIN_PREDICATES,
  OPERATION_TYPE_PACK,
  selectOperationsById,
} from "../../../../slices/operationsSlice";
import { useSelector } from "react-redux";
import { selectFocusedObjectId } from "../../../../slices/uiSlice";
import { withPackOperationData } from "../../../HOC";

const JoinPredicateButton = ({
  // Props passed via withPackOperationData HOC
  id,
  joinPredicate,
  setJoinPredicate,
  // Props passed from parent component
  disabled = false,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const options = Object.entries(JOIN_PREDICATES).map(([key, label]) => ({
    value: key,
    label:
      label.charAt(0).toUpperCase() +
      label.slice(1).toLowerCase().replace(/_/g, " "),
  }));

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (selectedValue) => {
    setJoinPredicate(selectedValue);
    handleClose();
  };

  const displayValue =
    options.find((opt) => opt.value === joinPredicate)?.label || "Select";

  return (
    <>
      <Button
        variant="outlined"
        size="small"
        disabled={disabled}
        onClick={handleClick}
        endIcon={<KeyboardArrowDownIcon />}
        sx={{ textTransform: "none" }}
      >
        {displayValue}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        {options.map((option) => (
          <MenuItem
            key={option.value}
            selected={option.value === joinPredicate}
            onClick={() => handleSelect(option.value)}
          >
            {option.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default JoinPredicateButton;
