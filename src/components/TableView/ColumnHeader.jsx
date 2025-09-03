import React from "react";
import withColumnData from "../HOC/withColumnData";

const ColumnHeader = ({ column }) => {
  // TODO: implement
  // const [columns, setColumns] = useState([]);
  // const fetchColumns = useCallback(async () => {
  //   const columns = await summarizeTable(id, activeColumnIds);
  //   setColumns(columns);
  // }, [id, activeColumnIds]);
  // useEffect(() => {
  //   // Fetch columns when component mounts
  //   fetchColumns();
  // }, [id, fetchColumns]);
  return (
    <>
      <strong>{column.name}</strong>
    </>
  );
};

const EnhancedColumnHeader = withColumnData(ColumnHeader);
export default EnhancedColumnHeader;
