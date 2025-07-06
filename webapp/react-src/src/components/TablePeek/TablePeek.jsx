import { useSelector } from "react-redux";
import { selectPeekedTable } from "../../slices/uiSlice";
import DBTableView from "./DBTableView";
import { isTableId } from "../../slices/tablesSlice";
import withTableData from "../HOC/withTableData";
import withOperationData from "../HOC/withOperationData";

export const COMPONENT_ID = "FOCUSED_TABLE_VIEW";

export default function TablePeek() {
  let EnhancedDBTableView;
  const id = useSelector(selectPeekedTable);
  if (!id) {
    return <pre>Unset</pre>;
  }
  if (isTableId(id)) {
    EnhancedDBTableView = withTableData(DBTableView);
  } else {
    EnhancedDBTableView = withOperationData(DBTableView);
  }

  return <EnhancedDBTableView id={id} />;
}
