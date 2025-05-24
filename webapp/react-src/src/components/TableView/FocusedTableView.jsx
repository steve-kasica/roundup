import { useSelector } from "react-redux";
import { selectFocusedTableId } from "../../data/slices/uiSlice/";
import TableView from "./TableView";

export const COMPONENT_ID = "FOCUSED_TABLE_VIEW";

export default function FocusedTableView() {
  const focusedTableId = useSelector(selectFocusedTableId);
  return <TableView id={focusedTableId} />;
}
