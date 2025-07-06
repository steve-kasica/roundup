import { useSelector, useDispatch } from "react-redux";
import PropTypes from "prop-types";

import {
  DATA_TYPE as COLUMN,
  selectColumnById,
  selectColumnIdsByTableId,
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
} from "../../slices/columnsSlice";

import { renameColumnsAction } from "../../sagas/renameColumnsSaga";
import { removeColumnsAction } from "../../sagas/removeColumnsSaga";
import { swapColumnsAction } from "../../sagas/swapColumnsSaga";

import { selectFirstSelectedColumn } from "../../slices/uiSlice";

import { useEffect } from "react";
import { useDrop, useDrag } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";

export default function withColumnData(WrappedComponent) {
  return function EnhancedComponent({ id, isDraggable = false, ...props }) {
    const dispatch = useDispatch();
    const isNull = id === null;
    let column = useSelector((state) =>
      !isNull ? selectColumnById(state, id) : null
    );
    const tableColumnIds = useSelector((state) =>
      column !== null ? selectColumnIdsByTableId(state, column.tableId) : []
    );
    const firstSelectedColumnId = useSelector(selectFirstSelectedColumn);
    const selectedColumns = useSelector(selectSelectedColumns);
    const hoveredColumns = useSelector(selectHoveredColumns);
    const loadingColumns = useSelector(selectLoadingColumns);

    // Column interaction state properties
    const isSelected = !isNull && selectedColumns.includes(id);
    const isLoading = !isNull && loadingColumns.includes(id);
    const isHovered = !isNull && hoveredColumns.includes(id);

    const name = column?.name;
    const tableId = column?.tableId;
    const index = column?.index;
    const columnType = column?.columnType;
    const values = column?.values;
    const error = column?.error;
    const alias = column?.alias;

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
          dispatch(
            swapColumnsAction({ sourceIds: droppedItem.id, targetIds: id })
          );
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
        column={column}
        dragRef={dragRef}
        dropRef={dropRef}
        id={id}
        tableId={tableId}
        name={name}
        alias={alias}
        index={index}
        columnType={columnType}
        values={values}
        isNull={isNull}
        // Interaction state props
        isSelected={isSelected}
        isLoading={isLoading}
        isHovered={isHovered}
        isDragging={isDragging}
        isOver={isOver}
        error={error}
        // Actions handlers
        hoverColumn={hoverColumn}
        unHoverColumn={unHoverColumn}
        renameColumn={(alias) => {
          if (!isNull)
            dispatch(
              renameColumnsAction({
                ids: id,
                aliases: alias,
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
        nullColumn={() => {
          if (!isNull) {
            // TODO: implement logic to nullify column
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

withColumnData.propTypes = {
  WrappedComponent: PropTypes.elementType,
};

// Add prop types for the EnhancedComponent returned by withColumnData
withColumnData.EnhancedComponentPropTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  isDraggable: PropTypes.bool,
};
