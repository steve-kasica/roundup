import { useSelector } from "react-redux";
import { selectSelectedColumnIds } from "../../data/slices/uiSlice";
import ColumnValueMatrix from "./ColumnValueMatrix";

export default function SelectedColumns() {
  const selectedColumnIds = useSelector(selectSelectedColumnIds);
  console.log("Selected column IDs:", selectedColumnIds);
  return <ColumnValueMatrix columnIds={selectedColumnIds} />;
}
