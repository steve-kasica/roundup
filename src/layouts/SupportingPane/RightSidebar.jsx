import { useSelector } from "react-redux";
import { SingleColumn } from "../../components/ColumnViews";
import { selectSelectedColumns } from "../../slices/columnsSlice";
import { Typography } from "@mui/material";

const RightSidebar = () => {
  const selectedColumns = useSelector(selectSelectedColumns);
  return (
    <>
      <Typography variant="h6" sx={{ p: 2 }}>
        Column detail view
      </Typography>
      {selectedColumns && selectedColumns.length === 1 && (
        <SingleColumn id={selectedColumns[0]} />
      )}
    </>
  );
};

export default RightSidebar;
