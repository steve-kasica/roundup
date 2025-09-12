import { useSelector } from "react-redux";
import SingleColumn from "./SingleColumn";
import { selectSelectedColumns } from "../../slices/columnsSlice";

const ColumnDetail = () => {
  const selectedColumns = useSelector(selectSelectedColumns);
  if (!selectedColumns || selectedColumns.length === 0) {
    return null;
  }
  if (selectedColumns.length === 1) {
    return <SingleColumn id={selectedColumns[0]} />;
  }
};

export default ColumnDetail;
