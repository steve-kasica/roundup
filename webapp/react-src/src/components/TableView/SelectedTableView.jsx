import { useSelector } from "react-redux";
import { selectSelectedTables } from "../../data/slices/uiSlice";
import TableView from "./TableView";

export const COMPONENT_ID = "FOCUSED_TABLE_VIEW";

export default function SelectedTableView() {
  const selectedTables = useSelector(selectSelectedTables);
  console.log("SelectedTableView", selectedTables);
  if (!selectedTables || selectedTables.length !== 1) {
    return <pre>ERROR</pre>;
  }
  const tableId = selectedTables[0];
  return <TableView id={tableId} />;
}
