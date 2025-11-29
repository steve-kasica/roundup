/* eslint-disable react/prop-types */
import { useSelector, useDispatch } from "react-redux";

import {
  selectColumnsById,
  selectColumnIndexById,
} from "../../slices/columnsSlice";
import {
  setFocusedColumnIds,
  removeFromHoveredColumnIds,
  addToHoveredColumnIds,
  isColumnIdHovered,
  isColumnIdSelected,
  isColumnIdDragging,
  isColumnIdDropTarget,
  isColumnIdFocused,
  isColumnIdVisible,
} from "../../slices/uiSlice";
import { updateColumnsRequest } from "../../sagas/updateColumnsSaga/actions";
import { deleteColumnsRequest } from "../../sagas/deleteColumnsSaga/actions";
import { useCallback, useMemo } from "react";
import withAssociatedAlerts from "../HOC/withAssociatedAlerts";

export default function withColumnData(WrappedComponent) {
  function EnhancedComponent({
    // Props passed directly from parent
    id,
    ...props
  }) {
    const dispatch = useDispatch();

    // Column data
    let column = useSelector((state) => selectColumnsById(state, id));
    const index = useSelector((state) =>
      selectColumnIndexById(state, id, column.parentId)
    );
    const parentId = column.tableId;

    // Column interaction state properties
    const isSelected = useSelector((state) => isColumnIdSelected(state, id));
    const isHovered = useSelector((state) => isColumnIdHovered(state, id));
    const isDragging = useSelector((state) => isColumnIdDragging(state, id));
    const isDropTarget = useSelector((state) =>
      isColumnIdDropTarget(state, id)
    );
    const isFocused = useSelector((state) => isColumnIdFocused(state, id));
    const isVisible = useSelector((state) => isColumnIdVisible(state, id));
    const isOver = isDropTarget && isHovered;
    const isKey = false; // TODO: implement isKey logic

    const nullCount = Math.floor(column.count * column.nullPercentage);
    const completeness = 1 - column.nullPercentage;
    const uniqueCount = Object.keys(column?.values || {}).length;
    const duplicateCount = column.count - nullCount - uniqueCount;
    const completeCount = column.count - nullCount;

    // Callback functions
    // --------------------------------------------------------------------
    const hoverColumn = useCallback(() => {
      dispatch(addToHoveredColumnIds(id));
    }, [dispatch, id]);

    const unhoverColumn = useCallback(() => {
      dispatch(removeFromHoveredColumnIds(id));
    }, [dispatch, id]);

    const renameColumn = useCallback(
      (name) => {
        dispatch(updateColumnsRequest({ columnUpdates: [{ id, name }] }));
      },
      [dispatch, id]
    );

    const setColumnType = useCallback(
      (columnType) =>
        dispatch(updateColumnsRequest({ columnUpdates: [{ id, columnType }] })),
      [dispatch, id]
    );

    const unfocusColumn = useCallback(() => {
      dispatch(setFocusedColumnIds([]));
    }, [dispatch]);

    const focusColumn = useCallback(() => {
      dispatch(setFocusedColumnIds([id]));
    }, [dispatch, id]);

    const deleteColumn = useCallback(
      () => dispatch(deleteColumnsRequest({ columnIds: [id] })),
      [dispatch, id]
    );

    const [modeValue, modeCount] = useMemo(() => {
      return [column?.topValues?.[0]?.value, column?.topValues?.[0]?.count];
    }, [column?.topValues]);

    return (
      <WrappedComponent
        {...props}
        // Props from withAssociatedAlerts
        id={id}
        parentId={parentId || column.parentId}
        // Column data props
        name={column.name}
        databaseName={column.databaseName}
        approxUnique={column.approxUnique}
        avg={column.avg}
        columnType={column.columnType}
        count={column.count}
        max={column?.max}
        min={column?.min}
        nullPercentage={column?.nullPercentage}
        p25={column?.p25}
        p50={column?.p50}
        p75={column?.p75}
        std={column?.std}
        modeValue={modeValue}
        modeCount={modeCount}
        topValues={column?.topValues}
        column={column}
        nullCount={nullCount} // Total number of null values
        completeness={completeness} // Percentage of non-null values
        completeCount={completeCount} // Total number of non-null values
        duplicateCount={duplicateCount} // Total number of duplicate values
        uniqueCount={uniqueCount}
        index={index}
        // Interaction state props
        isSelected={isSelected}
        isHovered={isHovered}
        isDragging={isDragging}
        isDropTarget={isDropTarget}
        isOver={isOver}
        isFocused={isFocused}
        isKey={isKey}
        isVisible={isVisible}
        // Actions handlers
        hoverColumn={hoverColumn}
        unhoverColumn={unhoverColumn}
        renameColumn={renameColumn}
        unfocusColumn={unfocusColumn}
        focusColumn={focusColumn}
        setColumnType={setColumnType}
        deleteColumn={deleteColumn}
      />
    );
  }

  // Wrap EnhancedComponent with withAssociatedAlerts
  return withAssociatedAlerts(EnhancedComponent);
}
