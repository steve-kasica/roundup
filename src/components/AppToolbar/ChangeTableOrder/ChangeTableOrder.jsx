import { SwapHoriz, SwapVert } from "@mui/icons-material";
import TooltipIconButton from "../../ui/buttons/TooltipIconButton";
import { useDispatch, useSelector } from "react-redux";
import { isTableId } from "../../../slices/tablesSlice";
import { selectFocusedObjectId } from "../../../slices/uiSlice";
import { useCallback, useMemo } from "react";
import {
  OPERATION_TYPE_PACK,
  OPERATION_TYPE_STACK,
} from "../../../slices/operationsSlice";
import { updateOperationsRequest } from "../../../sagas/updateOperationsSaga";

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

  const handleOnClick = useCallback(() => {
    if (focusedObject?.operationType === OPERATION_TYPE_PACK) {
      dispatch(
        updateOperationsRequest({
          operationUpdates: [
            {
              id: focusedObject.id,
              childIds: [...focusedObject.childIds].reverse(),
            },
          ],
        }),
      );
    }
  }, [dispatch, focusedObject]);

  const Icon =
    objectType === "operation" && focusedObject?.operationType === "stack"
      ? SwapVert
      : SwapHoriz;

  const isDisabled = useMemo(
    () =>
      !focusedObject ||
      isTableId(focusedObject.id) ||
      focusedObject?.operationType === OPERATION_TYPE_STACK,
    [focusedObject],
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
