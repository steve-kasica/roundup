import { useSelector } from "react-redux";
import { selectAllTablesData } from "../../slices/tablesSlice";
import { useCallback, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { createTablesRequest } from "../../sagas/createTablesSaga";

const withAllTablesData = (WrappedComponent) => {
  return function EnhancedComponent(props) {
    const dispatch = useDispatch();
    const tables = useSelector(selectAllTablesData);
    const [selectedTableIds, setSelectedTableIds] = useState([]);
    const rowMax = useMemo(
      () => Math.max(0, ...tables.map((table) => table.rowCount)),
      [tables]
    );
    const columnMax = useMemo(
      () => Math.max(0, ...tables.map((table) => table.columnIds.length)),
      [tables]
    );
    const bytesMax = useMemo(
      () => Math.max(0, ...tables.map((table) => table.size)),
      [tables]
    );
    const createTables = useCallback(
      (tableInfos) => {
        dispatch(createTablesRequest(tableInfos));
      },
      [dispatch]
    );

    return (
      <WrappedComponent
        {...props}
        tables={tables}
        selectedTableIds={selectedTableIds}
        setSelectedTableIds={setSelectedTableIds}
        rowMax={rowMax}
        columnMax={columnMax}
        bytesMax={bytesMax}
        createTables={createTables}
      />
    );
  };
};

export default withAllTablesData;
