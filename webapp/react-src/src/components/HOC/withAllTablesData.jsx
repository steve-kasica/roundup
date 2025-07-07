import { useSelector } from "react-redux";
import {
  selectAllTablesData,
  selectSelectedTables,
  clearSelectedTables,
} from "../../slices/tablesSlice";
import { useDispatch } from "react-redux";

const withAllTablesData = (WrappedComponent) => {
  return function EnhancedComponent(props) {
    const dispatch = useDispatch();
    const tables = useSelector(selectAllTablesData);
    const selectedTables = useSelector(selectSelectedTables);
    const isLoading = false; // TODO:
    const error = false; // TODO:
    return (
      <WrappedComponent
        {...props}
        tables={tables}
        selectedTables={selectedTables}
        isLoading={isLoading}
        error={error}
        unselectAllTables={() => dispatch(clearSelectedTables())}
      />
    );
  };
};

export default withAllTablesData;
