import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  selectSelectedColumnIds,
  selectHoveredColumnIds,
  selectFocusedColumnIds,
  selectVisibleColumnIds,
  selectDraggingColumnIds,
  selectDropTargetColumnIds,
  selectFocusedObjectId,
  selectSelectedMatches,
} from "../../slices/uiSlice/selectors";
import {
  setSelectedColumnIds,
  setHoveredColumnIds,
  addToHoveredColumnIds,
  removeFromHoveredColumnIds,
  setFocusedColumnIds,
  setVisibleColumnIds,
  setDraggingColumnIds,
  setDropTargetColumnIds,
  setFocusedObjectId,
  setSelectedMatches,
} from "../../slices/uiSlice/uiSlice";

/**
 * Higher-Order Component that provides UI state and interaction handlers
 * from the uiSlice to the wrapped component.
 *
 * This HOC follows the composition pattern used in other HOCs (like withOperationData)
 * and provides a clean interface to the global UI state for column selections,
 * hover states, focus management, and drag-and-drop interactions.
 *
 * @param {React.Component} WrappedComponent - The component to enhance with UI state
 * @returns {React.Component} Enhanced component with UI state and handlers
 */
export default function withGlobalInterfaceData(WrappedComponent) {
  return function EnhancedComponent({ id, ...props }) {
    const dispatch = useDispatch();

    // Selectors for UI state
    const selectedColumnIds = useSelector(selectSelectedColumnIds);
    const hoveredColumnIds = useSelector(selectHoveredColumnIds);
    const focusedColumnIds = useSelector(selectFocusedColumnIds);
    const visibleColumnIds = useSelector(selectVisibleColumnIds);
    const draggingColumnIds = useSelector(selectDraggingColumnIds);
    const dropTargetColumnIds = useSelector(selectDropTargetColumnIds);
    const focusedObjectId = useSelector(selectFocusedObjectId);
    const selectedMatches = useSelector(selectSelectedMatches);

    // Column selection handlers
    const selectColumns = useCallback(
      (columnIds) => dispatch(setSelectedColumnIds(columnIds)),
      [dispatch]
    );

    const clearSelectedColumns = useCallback(
      () => dispatch(setSelectedColumnIds([])),
      [dispatch]
    );

    // Hover handlers
    const setHoveredColumns = useCallback(
      (columnIds) => dispatch(setHoveredColumnIds(columnIds)),
      [dispatch]
    );

    const addToHoveredColumns = useCallback(
      (columnIds) => dispatch(addToHoveredColumnIds(columnIds)),
      [dispatch]
    );

    const removeFromHoveredColumns = useCallback(
      (columnIds) => dispatch(removeFromHoveredColumnIds(columnIds)),
      [dispatch]
    );

    const clearHoveredColumns = useCallback(
      () => dispatch(setHoveredColumnIds([])),
      [dispatch]
    );

    // Focus handlers
    const focusColumns = useCallback(
      (columnIds) => dispatch(setFocusedColumnIds(columnIds)),
      [dispatch]
    );

    const clearFocusedColumns = useCallback(
      () => dispatch(setFocusedColumnIds([])),
      [dispatch]
    );

    // Visibility handlers
    const setVisibleColumns = useCallback(
      (columnIds) => dispatch(setVisibleColumnIds(columnIds)),
      [dispatch]
    );

    const clearVisibleColumns = useCallback(
      () => dispatch(setVisibleColumnIds([])),
      [dispatch]
    );

    // Drag and drop handlers
    const setDraggingColumns = useCallback(
      (columnIds) => dispatch(setDraggingColumnIds(columnIds)),
      [dispatch]
    );

    const clearDraggingColumns = useCallback(
      () => dispatch(setDraggingColumnIds([])),
      [dispatch]
    );

    const setDropTargetColumns = useCallback(
      (columnIds) => dispatch(setDropTargetColumnIds(columnIds)),
      [dispatch]
    );

    const clearDropTargetColumns = useCallback(
      () => dispatch(setDropTargetColumnIds([])),
      [dispatch]
    );

    // Focus object handlers
    const setFocusedObject = useCallback(
      (objectId) => dispatch(setFocusedObjectId(objectId)),
      [dispatch]
    );

    const clearFocusedObject = useCallback(
      () => dispatch(setFocusedObjectId(null)),
      [dispatch]
    );

    // Match selection handlers
    const selectMatches = useCallback(
      (matches) => dispatch(setSelectedMatches(matches)),
      [dispatch]
    );

    const clearSelectedMatches = useCallback(
      () => dispatch(setSelectedMatches([])),
      [dispatch]
    );

    return (
      <WrappedComponent
        // Pass through all original props
        {...props}
        id={id}
        // UI State
        selectedColumnIds={selectedColumnIds}
        hoveredColumnIds={hoveredColumnIds}
        focusedColumnIds={focusedColumnIds}
        visibleColumnIds={visibleColumnIds}
        draggingColumnIds={draggingColumnIds}
        dropTargetColumnIds={dropTargetColumnIds}
        focusedObjectId={focusedObjectId}
        selectedMatches={selectedMatches}
        // Column selection actions
        selectColumns={selectColumns}
        clearSelectedColumns={clearSelectedColumns}
        // Hover actions
        setHoveredColumns={setHoveredColumns}
        addToHoveredColumns={addToHoveredColumns}
        removeFromHoveredColumns={removeFromHoveredColumns}
        clearHoveredColumns={clearHoveredColumns}
        // Focus actions
        focusColumns={focusColumns}
        clearFocusedColumns={clearFocusedColumns}
        // Visibility actions
        setVisibleColumns={setVisibleColumns}
        clearVisibleColumns={clearVisibleColumns}
        // Drag and drop actions
        setDraggingColumns={setDraggingColumns}
        clearDraggingColumns={clearDraggingColumns}
        setDropTargetColumns={setDropTargetColumns}
        clearDropTargetColumns={clearDropTargetColumns}
        // Focus object actions
        setFocusedObject={setFocusedObject}
        clearFocusedObject={clearFocusedObject}
        // Match selection actions
        selectMatches={selectMatches}
        clearSelectedMatches={clearSelectedMatches}
      />
    );
  };
}
