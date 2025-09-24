import { useSelector, useDispatch } from "react-redux";
import PropTypes from "prop-types";

import {
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
  setFocusedColumns,
} from "../../slices/columnsSlice";
import { renameColumnsRequest } from "../../sagas/renameColumnsSaga";
import { removeColumnsRequest } from "../../sagas/removeColumnsSaga";
import { swapColumnsRequest } from "../../sagas/swapColumnsSaga";
import { selectFirstSelectedColumn } from "../../slices/uiSlice";
import { selectTablesById } from "../../slices/tablesSlice";

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
    const table = useSelector((state) =>
      selectTablesById(state, column?.tableId)
    );

    // Column interaction state properties
    const isSelected = !isNull && selectedColumns.includes(id);
    const isLoading = !isNull && loadingColumns.includes(id);
    const isHovered = !isNull && hoveredColumns.includes(id);
    const isKey = !isNull && table?.keyColumnId === id;

    const name = column?.name;
    const tableId = column?.tableId;
    const index = column?.index;
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
        isKey={isKey}
        error={error}
        // Actions handlers
        hoverColumn={hoverColumn}
        unHoverColumn={unHoverColumn} // Deprecated
        unhoverColumn={unHoverColumn}
        renameColumn={(name) => {
          if (!isNull) dispatch(renameColumnsRequest({ ids: id, name }));
        }}
        unfocusColumn={unfocusColumn}
        dragColumn={() => (!isNull ? dispatch(addColumnsToDragging(id)) : null)}
        unDragColumn={unDragColumn}
        removeColumn={() => {
          if (!isNull) dispatch(removeColumnsRequest(id));
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
        focusColumn={() => {
          if (!isNull) {
            dispatch(setFocusedColumns(id));
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
        swapColumnsWithinTable={(srcColumnId, targetColumnId) =>
          dispatch(
            swapColumnsRequest({
              sourceIds: srcColumnId,
              targetIds: targetColumnId,
            })
          )
        }
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
