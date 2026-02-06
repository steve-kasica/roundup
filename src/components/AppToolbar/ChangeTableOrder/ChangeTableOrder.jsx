import { SwapHoriz, SwapVert } from "@mui/icons-material";
import TooltipIconButton from "../../ui/buttons/TooltipIconButton";
import { useDispatch, useSelector } from "react-redux";
import { isTableId } from "../../../slices/tablesSlice";
import { selectFocusedObjectId } from "../../../slices/uiSlice";
import { useCallback, useMemo } from "react";
import {
  OPERATION_TYPE_PACK,
  OPERATION_TYPE_STACK,
  selectRootOperationId,
} from "../../../slices/operationsSlice";
import { updateOperationsRequest } from "../../../sagas/updateOperationsSaga";

const ChangeTableOrder = () => {
  const dispatch = useDispatch();
  const focusedObjectId = useSelector(selectFocusedObjectId);
  const rootOperationId = useSelector(selectRootOperationId);
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

  const handleOnClick = useCallback(() => {
    if (focusedObject?.operationType === OPERATION_TYPE_PACK) {
      dispatch(
        updateOperationsRequest({
          id: focusedObject.id,
          childIds: [...focusedObject.childIds].reverse(),
        }),
      );
    }
  }, [dispatch, focusedObject]);

  const Icon =
    objectType === "operation" &&
    focusedObject?.operationType === OPERATION_TYPE_STACK
      ? SwapVert
      : SwapHoriz;

  const isDisabled = useMemo(
    () =>
      // No focused object
      !focusedObject ||
      // Focused object is a table
      isTableId(focusedObject.id) ||
      // Focused object is a stack operation
      focusedObject?.operationType === OPERATION_TYPE_STACK ||
      // Focused object is "read-only" (i.e. not a root operation)
      focusedObject?.id !== rootOperationId,
    [focusedObject, rootOperationId],
  );

  return (
    <TooltipIconButton
      tooltipText="Change table order"
      disabled={isDisabled}
      onClick={handleOnClick}
    >
      <Icon />
    </TooltipIconButton>
  );
};

export default ChangeTableOrder;
