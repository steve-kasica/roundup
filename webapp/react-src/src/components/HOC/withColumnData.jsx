import { useSelector, useDispatch } from "react-redux";
import {
  selectColumnById,
  selectColumnIdsByTableId,
} from "../../data/slices/columnsSlice/columnSelectors";
import {
  DATA_TYPE as COLUMN,
  removeColumnRequest,
  renameColumnRequest,
  setColumnDragStatus,
  swapColumnsRequest,
} from "../../data/slices/columnsSlice";
import {
  clearSelectedColumns,
  appendToSelectedColumns,
  removeFromSelectedColumns,
  isColumnSelected,
  selectFirstSelectedColumn,
  setSelectedColumns,
  setHoveredColumns,
  removeFromHoveredColumns,
  selectHoveredColumns,
} from "../../data/slices/uiSlice";
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

    const name = column?.name;
    const tableId = column?.tableId;
    const index = column?.index;
    const columnType = column?.columnType;
    const values = column?.values;
    const isNull = !column;
    const isSelected = useSelector((state) => isColumnSelected(state, id));
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
      dispatch(setColumnDragStatus({ id, isDragging }));
    }, [isDragging, id, dispatch]);

    const [{ isOver }, dropRef] = useDrop({
      accept: COLUMN,
      drop: (droppedItem) => {
        // In this context `droppedItem.id` === `id` in useDrag

        if (droppedItem.tableId === tableId && !isNull) {
          swapColumnWithinTable(droppedItem.id, id);
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
        isLoading={column?.status.isLoading}
        isHovered={hoveredColumns.includes(id)}
        isDragging={isDragging}
        isOver={isOver}
        error={error}
        hoverColumn={hoverColumn}
        unHoverColumn={unHoverColumn}
        renameColumn={() => {
          if (!isNull) {
            dispatch(
              // TODO: de-OpenRefine this action,
              // actions should be agnostic at this layer
              // and not depend on OpenRefine's data model
              renameColumnRequest({
                projectId: tableId,
                oldColumnName: name,
                newColumnName: newName,
                id,
              })
            );
          }
        }}
        unfocusColumn={unfocusColumn}
        dragColumn={dragColumn}
        unDragColumn={unDragColumn}
        removeColumn={() => {
          if (!isNull) dispatch(removeColumnRequest(id));
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

    function swapColumnWithinTable(sourceId, targetId) {
      dispatch(swapColumnsRequest({ sourceId, targetId }));
    }

    function dragColumn() {
      if (!isNull) {
        dispatch(setColumnDragStatus({ id, isDragging: true }));
      }
    }
    function unDragColumn() {
      dispatch(setColumnDragStatus({ id, isDragging: false }));
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
