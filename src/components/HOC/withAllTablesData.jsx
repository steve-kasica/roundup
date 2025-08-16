import { useSelector } from "react-redux";
import {
  selectAllTablesData,
  selectSelectedTables,
  clearSelectedTables,
} from "../../slices/tablesSlice";
import { useDispatch } from "react-redux";
import { selectColumnIdsByTableId } from "../../slices/columnsSlice";

const withAllTablesData = (WrappedComponent) => {
  return function EnhancedComponent(props) {
    const dispatch = useDispatch();
    const tables = useSelector(selectAllTablesData);
    const selectedTables = useSelector(selectSelectedTables);
    const rowMax = Math.max(0, ...tables.map((table) => table.rowCount));
    // TODO: This doesn't update when columns are removed, consider using a selector that listens to column changes
    const columnMax = useSelector((state) =>
      Math.max(
        0,
        ...tables.map(
          (table) => selectColumnIdsByTableId(state, table.id).length
        )
      )
    );
    const bytesMax = Math.max(0, ...tables.map((table) => table.size));
    console.log(columnMax, "columnMax");

    return (
      <WrappedComponent
        {...props}
        tables={tables}
        selectedTables={selectedTables}
        rowMax={rowMax}
        columnMax={columnMax}
        bytesMax={bytesMax}
        unselectAllTables={() => dispatch(clearSelectedTables())}
      />
    );
  };
};

export default withAllTablesData;
