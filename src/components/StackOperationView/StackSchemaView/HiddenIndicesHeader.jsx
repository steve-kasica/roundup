import { Button, Tooltip } from "@mui/material";
import { useDispatch } from "react-redux";
import { removeFromHiddenColumnIds } from "../../../slices/uiSlice";

const HiddenIndicesHeader = ({ columnIds, indices }) => {
  const dispatch = useDispatch();
  const handleOnClick = () => {
    dispatch(removeFromHiddenColumnIds(columnIds));
  };
  const minIndex = Math.min(...indices) + 1;
  const maxIndex = Math.max(...indices) + 1;
  return (
    <Tooltip
      title={`
                ${indices.length > 1 ? `${minIndex}...${maxIndex}` : `${minIndex}`}
    `}
    >
      <Button
        size="small"
        disableRipple
        sx={{
          minWidth: 0,
        }}
        onClick={handleOnClick}
      >
        ...
      </Button>
    </Tooltip>
  );
};

export default HiddenIndicesHeader;
