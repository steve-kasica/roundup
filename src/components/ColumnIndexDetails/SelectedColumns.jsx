import { useSelector } from "react-redux";
import { selectSelectedColumnIds } from "../../slices/columnsSlice";
import ColumnIndexDetails from "./ColumnIndexDetails";

export default function SelectedColumns() {
  const isOpen = useSelector((state) => state.ui.showColumnIndexDetails);
  const selectedColumnIds = useSelector(selectSelectedColumnIds);
  if (!isOpen) {
    return <div>Column Index Details is closed</div>;
  } else if (selectedColumnIds.length === 0) {
    return <div>No columns selected</div>;
  } else {
    return <ColumnIndexDetails columnIds={selectedColumnIds} />;
  }
}
