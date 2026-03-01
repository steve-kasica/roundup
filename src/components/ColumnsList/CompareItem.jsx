import { MenuItem } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import {
  selectSelectedColumnIds,
  selectFocusedColumnIds,
  setFocusedColumnIds,
} from "../../slices/uiSlice";
import { COLUMN_COMPARE_MAX } from "../../config";

const CompareItem = ({ item }) => {
  const dispatch = useDispatch();
  const selectedColumnIds = useSelector(selectSelectedColumnIds);
  const focusedColumnIds = useSelector(selectFocusedColumnIds);
  const disabled =
    selectedColumnIds.length > COLUMN_COMPARE_MAX ||
    selectedColumnIds.length <= 1;

  const handleClick = () => {
    if (!focusedColumnIds.includes(item.id)) {
      dispatch(setFocusedColumnIds(selectedColumnIds));
    }
  };

  return (
    <MenuItem disabled={disabled} onClick={handleClick}>
      Compare
    </MenuItem>
  );
};

export default CompareItem;
