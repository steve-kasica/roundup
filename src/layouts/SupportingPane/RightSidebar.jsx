import { useSelector } from "react-redux";
import { SingleColumn } from "../../components/ColumnViews";
import { selectSelectedColumns } from "../../slices/columnsSlice";
import { Typography } from "@mui/material";
import ColumnIndexDetails from "../../components/ColumnIndexDetails";

const RightSidebar = () => {
  const selectedColumns = useSelector(selectSelectedColumns);
  const isSingleColumn = selectedColumns && selectedColumns.length === 1;
  const isMultipleColumnsInStack =
    selectedColumns && selectedColumns.length > 1;
  // TODO: implement
  // const isMultipleColumnsInPack =
  //   selectedColumns && selectedColumns.length === 2 && false;
  // const isMultipleColumnInTable =
  //   selectedColumns && selectedColumns.length > 2 && false;
  return (
    <>
      <Typography variant="h6" sx={{ p: 2 }}>
        Column detail view
      </Typography>
      {isSingleColumn && <SingleColumn id={selectedColumns[0]} />}
      {isMultipleColumnsInStack && (
        <ColumnIndexDetails columnIds={selectedColumns} />
      )}
    </>
  );
};

export default RightSidebar;
