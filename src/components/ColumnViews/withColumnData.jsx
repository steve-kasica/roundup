import { useSelector, useDispatch } from "react-redux";
import PropTypes from "prop-types";

import {
  selectColumnById,
  selectColumnIdsByTableId,
  addColumnsToDragging,
  removeColumnsFromDragging,
  selectLoadingColumns,
  setFocusedColumnIds,
  selectDraggingColumns,
  selectDropTargets,
  selectHoverTargets,
  selectSelectedColumnIds,
  excludeColumnFromTable,
} from "../../slices/columnsSlice";
import { setHoveredColumn } from "../../slices/uiSlice";
import { updateColumnsRequest } from "../../sagas/updateColumnsSaga/actions";
import { deleteColumnsRequest } from "../../sagas/deleteColumnsSaga/actions";
import { isTableId, selectTablesById } from "../../slices/tablesSlice";
import { selectOperation } from "../../slices/operationsSlice";
import { createColumnsRequest } from "../../sagas/createColumnsSaga/actions";
import { CREATION_MODE_INSERTION } from "../../sagas/createColumnsSaga";
import { useCallback } from "react";

export default function withColumnData(WrappedComponent) {
  return function EnhancedComponent({ id, ...props }) {
    const dispatch = useDispatch();
    const isNull = id === null;
    let column = useSelector((state) =>
      !isNull ? selectColumnById(state, id) : null
    );
    const hoveredColumn = useSelector((state) => state.ui.hoveredColumn);
    const selectedColumns = useSelector(selectSelectedColumnIds);
    const loadingColumns = useSelector(selectLoadingColumns);
    const draggingColumns = useSelector(selectDraggingColumns);
    const dropTargetColumns = useSelector(selectDropTargets);
    const hoverTargetColumns = useSelector(selectHoverTargets);
    const table = useSelector((state) => {
      if (isNull) {
        return null;
      } else if (isTableId(column?.tableId)) {
        return selectTablesById(state, column?.tableId);
      } else {
        return selectOperation(state, column?.tableId);
      }
    });

    const activeTableColumnsIds = useSelector((state) =>
      selectColumnIdsByTableId(state, table?.id || null)
    );

    // Column interaction state properties
    const isSelected = selectedColumns.includes(id);
    const isLoading = !isNull && loadingColumns.includes(id);
    const isHovered = !isNull && hoveredColumn === id;
    const isDragging = !isNull && draggingColumns.includes(id);
    const isDropTarget = !isNull && dropTargetColumns.includes(id);
    const isOver = !isNull && hoverTargetColumns.includes(id);
    const isKey = !isNull && table?.keyColumnId === id;

    const name = column?.name;
    const tableId = column?.tableId;
    const index = activeTableColumnsIds.indexOf(id);
    const columnType = column?.columnType;
    const values = column?.values;
    const error = column?.error;
    const alias = column?.alias;
    const nullCount = isNull
      ? undefined
      : Math.floor(column.count * column.nullPercentage);
    const completeness = isNull ? 0 : 1 - column.nullPercentage;
    const uniqueCount = Object.keys(column?.values || {}).length;
    const duplicateCount = isNull ? 0 : column.count - nullCount - uniqueCount;
    const completeCount = isNull ? 0 : column.count - nullCount;

    const hoverColumn = useCallback(() => {
      dispatch(setHoveredColumn(id));
    }, [dispatch, id]);

    return (
      <WrappedComponent
        {...props}
        column={column}
        nullCount={nullCount} // Total number of null values
        completeness={completeness} // Percentage of non-null values
        completeCount={completeCount} // Total number of non-null values
        duplicateCount={duplicateCount} // Total number of duplicate values
        uniqueCount={uniqueCount}
        mode={
          Object.entries(column?.values || {}).reduce(
            (a, b) => (a[1] > b[1] ? a : b),
            ["", 0]
          )[0]
        }
        // Column data props
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
        isDropTarget={isDropTarget}
        isOver={isOver}
        isKey={isKey}
        error={error}
        // Actions handlers
        hoverColumn={hoverColumn}
        unhoverColumn={unHoverColumn}
        renameColumn={(name) => {
          if (!isNull)
            dispatch(updateColumnsRequest({ columnUpdates: [{ id, name }] }));
        }}
        unfocusColumn={unfocusColumn}
        dragColumn={() => (!isNull ? dispatch(addColumnsToDragging(id)) : null)}
        unDragColumn={unDragColumn}
        removeColumn={() => {
          // @Deprecated, use excludeColumn instead
          if (!isNull) dispatch(deleteColumnsRequest(id));
        }}
        excludeColumn={() => dispatch(excludeColumnFromTable(id))}
        includeColumn={() => {
          // TODO
        }}
        addColumnToSelection={() => {
          // TODO
        }}
        selectSingleColumn={() => {
          // TODO: clear selection if already selected
          dispatch(
            updateColumnsRequest({
              columnUpdates: [{ id, isSelected: true }],
            })
          );
        }}
        focusColumn={() => {
          if (!isNull) {
            dispatch(setFocusedColumnIds(id));
          }
        }}
        unselectColumn={() => {
          dispatch(
            updateColumnsRequest({ columnUpdates: [{ id, isSelected: false }] })
          );
        }}
        // TODO: DELETE
        spanSelectionToColumn={() => {
          // if (!isNull && firstSelectedColumnId) {
          //   const anchorIdx = tableColumnIds.indexOf(firstSelectedColumnId);
          //   const [start, end] = [anchorIdx, index].sort((a, b) => a - b);
          //   const selectedColumns = tableColumnIds.slice(start, end + 1);
          // }
        }}
        nullColumn={() => {
          if (!isNull) {
            // TODO: implement logic to nullify column
          }
        }}
        setColumnType={(columnType) =>
          dispatch(
            updateColumnsRequest({ columnUpdates: [{ id, columnType }] })
          )
        }
        insertColumnLeft={() =>
          dispatch(
            createColumnsRequest({
              mode: CREATION_MODE_INSERTION,
              columnInfo: [{ parentId: tableId, index }],
            })
          )
        }
        insertColumnRight={() =>
          dispatch(
            createColumnsRequest({
              mode: CREATION_MODE_INSERTION,
              columnInfo: [{ parentId: tableId, index: index + 1 }],
            })
          )
        }
        // insertColumnRight={() => {
        //   if (!isNull) {
        //     dispatch(
        //     );
        //   }
        // }}
      />
    );

    function unDragColumn() {
      if (!isNull) dispatch(removeColumnsFromDragging(id));
    }

    function unfocusColumn() {
      dispatch(
        updateColumnsRequest({ columnUpdates: [{ id, isSelected: false }] })
      );
    }

    function unHoverColumn() {
      // TODO: is this necessary?
      // if (!isNull) {
      //   dispatch(removeFromHoveredColumns(id));
      // }
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
