import { useSelector } from "react-redux";
import { selectSelectedColumns } from "../../data/slices/columnsSlice";
import ColumnValueMatrix from "./ColumnValueMatrix";

export default function SelectedColumns() {
  const selectedColumnIds = useSelector(selectSelectedColumns);
  console.log("Selected column IDs:", selectedColumnIds);
  return <ColumnValueMatrix columnIds={selectedColumnIds} />;
}
