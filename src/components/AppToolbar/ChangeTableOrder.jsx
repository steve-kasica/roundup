import { SwapHoriz, SwapVert } from "@mui/icons-material";
import TooltipIconButton from "../ui/buttons/TooltipIconButton";
import { useDispatch, useSelector } from "react-redux";
import { isTableId } from "../../slices/tablesSlice";
import { selectFocusedObjectId } from "../../slices/uiSlice";
import { useMemo } from "react";

const ChangeTableOrder = () => {
  const dispatch = useDispatch();
  const focusedObjectId = useSelector(selectFocusedObjectId);
  const objectType = useMemo(() => {
    return isTableId(focusedObjectId) ? "table" : "operation";
  }, [focusedObjectId]);

  const focusedObject = useSelector((state) => {
    if (isTableId(focusedObjectId)) {
      return state.tables.byId[focusedObjectId];
    } else {
      return state.operations.byId[focusedObjectId];
    }
  });

  const Icon =
    objectType === "operation" && focusedObject?.operationType === "stack"
      ? SwapVert
      : SwapHoriz;

  return (
    <TooltipIconButton
      tooltipText="Change table order"
      disabled={objectType === "table"}
    >
      <Icon />
    </TooltipIconButton>
  );
};

export default ChangeTableOrder;
