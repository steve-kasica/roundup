import { useSelector } from "react-redux";
import { selectSelectedColumns } from "../../data/slices/columnsSlice";
import ColumnValueMatrix from "./ColumnValueMatrix";

export default function SelectedColumns() {
  const selectedColumnIds = useSelector(selectSelectedColumns);
  if (selectedColumnIds.length === 0) {
    return <div>No columns selected</div>;
  }
  return <ColumnValueMatrix columnIds={selectedColumnIds} />;
}
