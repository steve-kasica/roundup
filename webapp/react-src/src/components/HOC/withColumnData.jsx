import { useSelector, useDispatch } from "react-redux";

import {
  DATA_TYPE as COLUMN,
  selectColumnById,
  selectColumnIdsByTableId,
  swapColumns,
  addColumnsToDragging,
  removeColumnsFromDragging,
  setHoveredColumns,
  removeFromHoveredColumns,
  selectHoveredColumns,
  selectLoadingColumns,
  setSelectedColumns,
  clearSelectedColumns,
  appendToSelectedColumns,
  removeFromSelectedColumns,
  selectSelectedColumns,
} from "../../data/slices/columnsSlice";

import { renameColumnsAction } from "../../data/sagas/renameColumnsSaga";
import { removeColumnsAction } from "../../data/sagas/removeColumnsSaga";

import { selectFirstSelectedColumn } from "../../data/slices/uiSlice";

import { useEffect } from "react";
import { useDrop, useDrag } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";

export default function withColumnData(WrappedComponent) {
  return function EnhancedComponent({ id, isDraggable = false, ...props }) {
    const dispatch = useDispatch();
    const column = useSelector((state) => selectColumnById(state, id));
    const tableColumnIds = useSelector((state) =>
      selectColumnIdsByTableId(state, column?.tableId)
    );
    const firstSelectedColumnId = useSelector(selectFirstSelectedColumn);
    const hoveredColumns = useSelector(selectHoveredColumns);
    const loadingColumns = useSelector(selectLoadingColumns);
    const selectedColumns = useSelector(selectSelectedColumns);

    const name = column?.name;
    const tableId = column?.tableId;
    const index = column?.index;
    const columnType = column?.columnType;
    const values = column?.values;
    const isNull = !column;
    const isSelected = selectedColumns.includes(id);
    const error = column?.error;

    const [{ isDragging }, dragRef, previewRef] = useDrag({
      type: COLUMN,
      canDrag: isDraggable,
      item: () => {
        // In this context `id` is the dragging column. It's different from `id` in useDrop
        return { id, name, tableId, isNull, index };
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      end: () => {
        unDragColumn();
        unHoverColumn();
      },
    });

    useEffect(() => {
      if (isDragging) {
        dispatch(addColumnsToDragging(id));
      } else {
        dispatch(removeColumnsFromDragging(id));
      }
    }, [isDragging, id, dispatch]);

    const [{ isOver }, dropRef] = useDrop({
      accept: COLUMN,
      drop: (droppedItem) => {
        // In this context `droppedItem.id` === `id` in useDrag

        if (droppedItem.tableId === tableId && !isNull) {
          dispatch(swapColumns({ sourceId: droppedItem.id, targetId: id }));
        }
        unDragColumn();
        dispatch(clearSelectedColumns());
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
    });

    // Disable the default drag preview
    useEffect(() => {
      previewRef(getEmptyImage(), { captureDraggingState: true });
    }, []);

    return (
      <WrappedComponent
        {...props}
        dragRef={dragRef}
        dropRef={dropRef}
        id={id}
        tableId={tableId}
        name={name}
        index={index}
        columnType={columnType}
        values={values}
        isNull={isNull}
        isSelected={isSelected}
        isLoading={loadingColumns.includes(id)}
        isHovered={hoveredColumns.includes(id)}
        isDragging={isDragging}
        isOver={isOver}
        error={error}
        hoverColumn={hoverColumn}
        unHoverColumn={unHoverColumn}
        renameColumn={(newName) => {
          if (!isNull)
            dispatch(
              renameColumnsAction({
                id,
                newColumnName: newName,
              })
            );
        }}
        unfocusColumn={unfocusColumn}
        dragColumn={() => (!isNull ? dispatch(addColumnsToDragging(id)) : null)}
        unDragColumn={unDragColumn}
        removeColumn={() => {
          if (!isNull) dispatch(removeColumnsAction(id));
        }}
        addColumnToSelection={() => {
          if (!isNull) dispatch(appendToSelectedColumns(id));
        }}
        selectSingleColumn={() => {
          if (!isNull) {
            dispatch(clearSelectedColumns());
            dispatch(appendToSelectedColumns(id));
          }
        }}
        unselectColumn={() => {
          if (!isNull) dispatch(removeFromSelectedColumns(id));
        }}
        // TODO: swapping columns messes with the index property used here
        // investigate further
        spanSelectionToColumn={() => {
          if (!isNull && firstSelectedColumnId) {
            const anchorIdx = tableColumnIds.indexOf(firstSelectedColumnId);
            const [start, end] = [anchorIdx, index].sort((a, b) => a - b);
            const selectedColumns = tableColumnIds.slice(start, end + 1);
            dispatch(setSelectedColumns(selectedColumns));
          }
        }}
      />
    );

    function unDragColumn() {
      if (!isNull) dispatch(removeColumnsFromDragging(id));
    }

    function unfocusColumn() {
      if (!isNull) {
        dispatch(removeFromSelectedColumns(id));
      }
    }

    function hoverColumn() {
      if (!isNull) {
        dispatch(setHoveredColumns(id));
      }
    }

    function unHoverColumn() {
      if (!isNull) {
        dispatch(removeFromHoveredColumns(id));
      }
    }
  };
}
