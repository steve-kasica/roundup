import { MenuItem } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import {
  selectSelectedColumnIds,
  selectFocusedColumnIds,
  setFocusedColumnIds,
} from "../../slices/uiSlice";

const SummarizeItem = () => {
  const dispatch = useDispatch();
  const selectedColumnIds = useSelector(selectSelectedColumnIds);
  const disabled = selectedColumnIds.length !== 1;

  const handleClick = () => {
    dispatch(setFocusedColumnIds(selectedColumnIds));
  };

  return (
    <MenuItem disabled={disabled} onClick={handleClick}>
      Summarize
    </MenuItem>
  );
};

export default SummarizeItem;
