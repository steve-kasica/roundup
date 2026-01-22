import { Button, Tooltip } from "@mui/material";
import { useDispatch } from "react-redux";
import { removeFromHiddenColumnIds } from "../../slices/uiSlice";

const HiddenColumnsLabel = ({ columnIds }) => {
  const dispatch = useDispatch();
  const handleOnClick = () => {
    dispatch(removeFromHiddenColumnIds(columnIds));
  };
  return (
    <Tooltip title={`${columnIds.length} hidden columns`}>
      <Button
        sx={{ minWidth: 0, padding: 0, textAlign: "center" }}
        onClick={handleOnClick}
      >
        ...
      </Button>
    </Tooltip>
  );
};

export default HiddenColumnsLabel;
