import { useDispatch, useSelector } from "react-redux";
import { selectFocusedObjectId } from "../../slices/uiSlice";
import { useCallback, useMemo } from "react";
import { isTableId } from "../../slices/tablesSlice";
import { updateTablesRequest } from "../../sagas/updateTablesSaga";
import { updateOperationsRequest } from "../../sagas/updateOperationsSaga";
import FreeTextDialogButton from "../ui/buttons/FreeTextDialogButton";
import { isOperationId } from "../../slices/operationsSlice";

const RenameFocusedObjectButton = () => {
  const dispatch = useDispatch();
  const focusedObjectId = useSelector(selectFocusedObjectId);
  // TODO: memoize selector
  const focusedObject = useSelector((state) => {
    if (isTableId(focusedObjectId)) {
      return state.tables.byId[focusedObjectId];
    } else {
      return state.operations.byId[focusedObjectId];
    }
  });

  const onRenameConfirm = useCallback(
    (nextName) => {
      if (isTableId(focusedObjectId)) {
        dispatch(
          updateTablesRequest([
            {
              id: focusedObjectId,
              name: nextName,
            },
          ]),
        );
      } else if (isOperationId(focusedObjectId)) {
        dispatch(
          updateOperationsRequest([
            {
              id: focusedObjectId,
              name: nextName,
            },
          ]),
        );
      } else {
        throw new Error(`Unexpected focused object id: ${focusedObjectId}`);
      }
    },
    [dispatch, focusedObjectId],
  );

  const objectType = useMemo(() => {
    return isTableId(focusedObjectId) ? "table" : "operation";
  }, [focusedObjectId]);

  return (
    <FreeTextDialogButton
      tooltipText={`Rename focused ${objectType}`}
      inputTitle={`Rename ${objectType}: ${focusedObject?.name || ""}`}
      onConfirm={onRenameConfirm}
      disabled={!focusedObjectId}
    />
  );
};

export default RenameFocusedObjectButton;
