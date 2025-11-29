import { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectFocusedObjectId } from "../../slices/uiSlice";
import {
  isOperationId,
  selectOperationsById,
} from "../../slices/operationsSlice";
import { isTableId, selectTablesById } from "../../slices/tablesSlice";
import { setFocusedObjectId } from "../../slices/uiSlice/uiSlice";
import { updateOperationsRequest } from "../../sagas/updateOperationsSaga";

/**
 * Higher-Order Component that provides data and actions for the currently focused object
 * (either a table or an operation) from the Redux state.
 *
 * This HOC integrates seamlessly with withOperationData and other HOCs to provide
 * focused object management capabilities. It determines the type of the focused object
 * and retrieves the appropriate data.
 *
 * @param {React.Component} WrappedComponent - The component to enhance with focused object data
 * @returns {React.Component} Enhanced component with focused object state and handlers
 */
export default function withFocusedObjectData(WrappedComponent) {
  return function EnhancedComponent({ id, ...props }) {
    const dispatch = useDispatch();
    const focusedObjectId = useSelector(selectFocusedObjectId);

    // Determine the type and retrieve the focused object
    const focusedObjectType = useMemo(() => {
      if (!focusedObjectId) return null;
      if (isOperationId(focusedObjectId)) return "operation";
      if (isTableId(focusedObjectId)) return "table";
      return null;
    }, [focusedObjectId]);

    const focusedObject = useSelector((state) => {
      if (!focusedObjectId || !focusedObjectType) return null;
      if (focusedObjectType === "operation") {
        return selectOperationsById(state, focusedObjectId);
      }
      if (focusedObjectType === "table") {
        return selectTablesById(state, focusedObjectId);
      }
      return null;
    });

    // Check if the current component's ID matches the focused object
    const isFocused = useMemo(
      () => id === focusedObjectId,
      [id, focusedObjectId]
    );

    // Action to focus this object
    const focusObject = useCallback(
      () => dispatch(setFocusedObjectId(id)),
      [dispatch, id]
    );

    // Action to clear focus
    const clearFocus = useCallback(
      () => dispatch(setFocusedObjectId(null)),
      [dispatch]
    );

    // Action to insert tables into the focused operation (if it's an operation)
    const insertTablesInFocusedOperation = useCallback(
      (tableIds) => {
        if (!focusedObject || focusedObjectType !== "operation") {
          console.warn(
            "Cannot insert tables: no operation is focused",
            focusedObjectType
          );
          return;
        }

        const currentChildIds = focusedObject.childIds || [];
        const updatedChildIds = Array.from(
          new Set([...currentChildIds, ...tableIds])
        );

        dispatch(
          updateOperationsRequest({
            operationUpdates: [
              {
                id: focusedObject.id,
                childIds: updatedChildIds,
              },
            ],
          })
        );
      },
      [dispatch, focusedObject, focusedObjectType]
    );

    return (
      <WrappedComponent
        // Pass through all original props
        {...props}
        id={id}
        // Focused object state
        focusedObjectId={focusedObjectId}
        focusedObjectType={focusedObjectType}
        focusedObject={focusedObject}
        isFocused={isFocused}
        // Focused object actions
        focusObject={focusObject}
        clearFocus={clearFocus}
        insertTablesInFocusedOperation={insertTablesInFocusedOperation}
      />
    );
  };
}
