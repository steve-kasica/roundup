import { useSelector, useDispatch } from "react-redux";
import { selectColumnById } from "../../data/slices/columnsSlice/columnSelectors";
import {
  DATA_TYPE as COLUMN,
  clearSelectedColumns,
  removeColumnRequest,
  renameColumnRequest,
  setColumnDragStatus,
  setColumnHoveredStatus,
  setColumnSelectedStatus,
  swapColumnsRequest,
} from "../../data/slices/columnsSlice";
import { useEffect } from "react";
import { useDrop, useDrag } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";

export default function withColumnData(WrappedComponent) {
  return function EnhancedComponent({ id, isDraggable = false, ...props }) {
    const dispatch = useDispatch();
    const column = useSelector((state) => selectColumnById(state, id));

    const name = column?.name;
    const tableId = column?.tableId;
    const index = column?.index;
    const columnType = column?.columnType;
    const values = column?.values;
    const isNull = !column;
    const isSelected = column?.status.isSelected;
    const isLoading = column?.status.isLoading;
    const isHovered = column?.status.isHovered;
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
        isLoading={isLoading}
        isHovered={isHovered}
        isDragging={isDragging}
        isOver={isOver}
        error={error}
        hoverColumn={hoverColumn}
        unHoverColumn={unHoverColumn}
        renameColumn={renameColumn}
        unfocusColumn={unfocusColumn}
        dragColumn={dragColumn}
        unDragColumn={unDragColumn}
        removeColumn={removeColumn}
        selectColumn={selectColumn}
        unselectColumn={unselectColumn}
        toggleColumnSelected={toggleColumnSelected}
      />
    );

    function renameColumn(newName) {
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

    function removeColumn() {
      if (!isNull) {
        dispatch(removeColumnRequest(id));
      }
    }

    function unselectColumn() {
      if (!isNull) {
        dispatch(setColumnSelectedStatus({ id, isSelected: false }));
      }
    }
    function selectColumn() {
      if (!isNull) {
        dispatch(setColumnSelectedStatus({ id, isSelected: true }));
      }
    }
    function toggleColumnSelected() {
      if (!isNull) {
        if (!isSelected) {
          selectColumn();
        } else {
          unselectColumn();
        }
      }
    }

    function unfocusColumn() {
      if (!isNull) {
        dispatch(setColumnSelectedStatus({ id, isSelected: false }));
      }
    }

    function hoverColumn() {
      if (!isNull) {
        dispatch(setColumnHoveredStatus({ id, isHovered: true }));
      }
    }

    function unHoverColumn() {
      if (!isNull) {
        dispatch(setColumnHoveredStatus({ id, isHovered: false }));
      }
    }
  };
}
