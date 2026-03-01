import { MenuItem } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { selectAllColumnIds } from "../../slices/columnsSlice/selectors";
import {
  selectSelectedColumnIds,
  setSelectedColumnIds,
} from "../../slices/uiSlice";

const SelectAllItem = () => {
  const dispatch = useDispatch();
  const allColumnIds = useSelector(selectAllColumnIds);
  const selectedColumnIds = useSelector(selectSelectedColumnIds);
  const allSelected =
    allColumnIds.length > 0 && selectedColumnIds.length === allColumnIds.length;

  return (
    <MenuItem
      disabled={allSelected || allColumnIds.length === 0}
      onClick={() => dispatch(setSelectedColumnIds(allColumnIds))}
    >
      Select All
    </MenuItem>
  );
};

export default SelectAllItem;
