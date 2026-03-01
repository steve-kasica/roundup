import { MenuItem } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import {
  selectSelectedColumnIds,
  setSelectedColumnIds,
} from "../../slices/uiSlice";

const DeselectAllItem = () => {
  const dispatch = useDispatch();
  const selectedColumnIds = useSelector(selectSelectedColumnIds);

  return (
    <MenuItem
      disabled={selectedColumnIds.length === 0}
      onClick={() => dispatch(setSelectedColumnIds([]))}
    >
      Deselect All
    </MenuItem>
  );
};

export default DeselectAllItem;
