import { useSelector } from "react-redux";
import { selectSelectedColumns } from "../../data/slices/columnsSlice";
import ColumnValueMatrix from "./ColumnValueMatrix";

export default function SelectedColumns() {
  const selectedColumnIds = useSelector(selectSelectedColumns);
  return <ColumnValueMatrix columnIds={selectedColumnIds} />;
}
