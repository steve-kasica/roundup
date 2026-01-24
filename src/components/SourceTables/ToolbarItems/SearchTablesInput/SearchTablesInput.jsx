import { useDispatch } from "react-redux";
import { SearchTextBox } from "../../../ui/input";
import { setTableSearchString } from "../../../../slices/uiSlice";

const SearchTablesInput = () => {
  const dispatch = useDispatch();

  const onChange = (value) => {
    const trimmedValue = value.trim().toLowerCase();
    dispatch(setTableSearchString(trimmedValue));
  };
  return <SearchTextBox placeholder="Search tables..." onChange={onChange} />;
};
export default SearchTablesInput;
