import { useSelector, useDispatch } from "react-redux";
import {
  selectOperation,
  selectOperationDepth,
  selectFocusedOperationId,
  setHoveredOperation,
  selectHoveredOperation,
  updateOperations,
  setFocusedOperation,
} from "../slices/operationsSlice";
import { setPeekedTable } from "../slices/uiSlice";
import {
  selectColumnIdsByTableId,
  selectRemovedColumnIdsByTableId,
} from "../slices/columnsSlice";
import { useMemo } from "react";

export default function useOperationData(id) {
  const dispatch = useDispatch();

  const operation = useSelector((state) => selectOperation(state, id));
  const depth = useSelector((state) => selectOperationDepth(state, id));
  const focusedOperationId = useSelector(selectFocusedOperationId);
  const hoveredOperationId = useSelector(selectHoveredOperation);
  const columnIds = useSelector((state) => selectColumnIdsByTableId(state, id));
  const removedColumnIds = useSelector((state) =>
    selectRemovedColumnIdsByTableId(state, id)
  );

  const activeColumnIds = useMemo(
    () => columnIds.filter((columnId) => !removedColumnIds.includes(columnId)),
    [columnIds, removedColumnIds]
  );

  return {
    operation,
    id,
    depth,
    columnCount: columnIds.length,
    columnIds,
    removedColumnIds,
    activeColumnIds,
    rowCount: operation?.rowCount,
    isFocused: operation?.id === focusedOperationId,
    isHovered: operation?.id === hoveredOperationId,
    operationType: operation?.operationType,
    childrenIds: operation?.children || [],
    onHover: () => dispatch(setHoveredOperation(id)),
    onUnhover: () => dispatch(setHoveredOperation(null)),
    peekTable: () => dispatch(setPeekedTable(id)),
    renameOperation: (newName) =>
      dispatch(updateOperations({ id, name: newName })),
    focusOperation: () => dispatch(setFocusedOperation({ id })),
  };
}
