import { Select, ListSubheader, MenuItem } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import {
  selectFocusedObjectId,
  setFocusedColumnIds,
  setFocusedObjectId,
} from "../../../slices/uiSlice";
import {
  EnhancedTableMenuItemContent,
  EnhancedOperationMenuItemContent,
} from "./ObjectMenuItemContent";
import { selectAllOperationIds } from "../../../slices/operationsSlice";

const FocusedObjectSelect = () => {
  const dispatch = useDispatch();
  const focusedObjectId = useSelector(selectFocusedObjectId);
  const tableIds = useSelector((state) => state.tables.allIds); // TODO: add selector for this query

  // Select all operation IDs (excluding NO_OP operations)
  const operationIds = useSelector((state) =>
    selectAllOperationIds(state, false),
  );

  const handleOnChange = (event) => {
    const selectedId = event.target.value;
    dispatch(setFocusedObjectId(selectedId));
    dispatch(setFocusedColumnIds([])); // Clear focused column IDs when changing the focused object
  };

  return (
    <Select
      size="small"
      value={focusedObjectId || ""}
      displayEmpty
      disabled={tableIds.length === 0 && operationIds.length === 0}
      onChange={handleOnChange}
      sx={{ minWidth: 175 }}
      aria-label="Select focused table or operation"
    >
      {tableIds.length > 0 && [
        <ListSubheader key="tables-header">Tables</ListSubheader>,
        ...tableIds.map((id) => (
          <MenuItem key={id} value={id}>
            <EnhancedTableMenuItemContent id={id} />
          </MenuItem>
        )),
      ]}
      {operationIds.length > 0 && [
        <ListSubheader key="operations-header">Operations</ListSubheader>,
        ...operationIds.map((id) => (
          <MenuItem key={id} value={id}>
            <EnhancedOperationMenuItemContent id={id} />
          </MenuItem>
        )),
      ]}
    </Select>
  );
};

export default FocusedObjectSelect;
