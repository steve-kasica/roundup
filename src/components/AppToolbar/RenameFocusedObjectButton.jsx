import { useDispatch, useSelector } from "react-redux";
import { selectFocusedObjectId } from "../../slices/uiSlice";
import { useCallback, useMemo } from "react";
import { isTableId, updateTables } from "../../slices/tablesSlice";
import { RenameObjectButton } from "../ui/buttons";
import FreeTextDialogButton from "../ui/buttons/FreeTextDialogButton";

const RenameFocusedObjectButton = (props) => {
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
          updateTables({
            id: focusedObjectId,
            name: nextName,
          })
        );
      }
    },
    [dispatch, focusedObjectId]
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
