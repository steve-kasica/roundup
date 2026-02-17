/**
 * @fileoverview Higher-Order Component for column data and interactions.
 * @module components/HOC/withColumnData
 *
 * Provides comprehensive access to column data, metadata, statistics,
 * and interaction handlers from Redux state.
 *
 * Features:
 * - Column identity and metadata (name, type, database name)
 * - Column statistics (count, unique values, duplicates, null count)
 * - Interaction state (hover, selected, focused, dragging, drop target)
 * - Column update and delete actions
 * - Focus and visibility management
 * - Parent table/operation association
 *
 * @example
 * import withColumnData from './withColumnData';
 * const EnhancedColumn = withColumnData(ColumnComponent);
 * <EnhancedColumn id="c1" />
 */
import { useSelector, useDispatch } from "react-redux";

import { selectColumnsById } from "../../slices/columnsSlice";
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
import { isTableId, selectTablesById } from "../../slices/tablesSlice";
import { insertColumnsRequest } from "../../sagas/createColumnsSaga";

export default function withColumnData(WrappedComponent) {
  function EnhancedComponent({ id, ...props }) {
    const dispatch = useDispatch();

    const column = useSelector((state) => selectColumnsById(state, id));

    // TODO: memoize
    const operationIndex = useSelector((state) => {
      if (isTableId(column.parentId)) {
        const parent = selectTablesById(state, column.parentId);
        return state.operations.allIds.indexOf(parent.parentId);
      } else {
        return state.operations.allIds.indexOf(column.parentId);
      }
    });

    // Identity and metadata
    // --------------------------------------------------------------------

    /**
     * The ID of the parent table/operation that this column belongs to.
     * @type {string}
     */
    const parentId = useMemo(() => column.parentId, [column]);

    /**
     * The name of the corresponding column in the database.
     * @type {string}
     */
    const databaseName = useMemo(() => column.databaseName, [column]);

    /**
     * The display name of the column, specified by the user or defaulting
     * to "Column" if not set.
     * @type {string|null}
     */
    const name = useMemo(
      () => column.name || databaseName,
      [column.name, databaseName],
    );

    /**
     * The index of the column within its parent table/operation, used for ordering.
     * @type {number}
     */
    const index = useMemo(() => column.index, [column]);

    /**
     * The data type of the column, defined in `Column.js`, e.g.
     * - `COLUMN_TYPE_CATEGORICAL`
     * - `COLUMN_TYPE_NUMERICAL`
     * @type {string}
     */
    const columnType = useMemo(() => column.columnType, [column]);

    /**
     * The count of non-null values in the column.
     * @type {number|null}
     */
    const count = useMemo(() => column.count || null, [column]);

    /**
     * The approximate number of unique values in the column.
     * @type {number}
     */
    const approxUnique = useMemo(() => column.approxUnique || null, [column]);

    /**
     * The percentage of unique values in the column.
     * Answers the question, "What percentage of the values in this column are unique?"
     * If all values are unique, this will be 1.0 (100%).
     * @type {number}
     */
    const uniquePercentage = useMemo(
      () => approxUnique / count,
      [approxUnique, count],
    );

    /**
     * The approximate number of duplicate values in the column.
     *
     * TODO: rename to approxDuplicate to avoid confusion with exact duplicate count
     * @type {number}
     */
    const duplicateCount = useMemo(
      () => count - approxUnique,
      [count, approxUnique],
    );

    /**
     * The top values for the column, representing the most common
     * values and their counts. Top values is an important part of
     * identifying a column becasue a few values can convey a lot
     * of semantic information about the column.
     *
     * TODO: how many top values are stored? Is this configurable?
     * @type {Array|null}
     */
    const topValues = useMemo(() => column.topValues || null, [column]);

    // Statistical metadata
    // --------------------------------------------------------------------

    const [modeValue, modeCount] = useMemo(() => {
      return [column?.topValues?.[0]?.value, column?.topValues?.[0]?.count];
    }, [column?.topValues]);

    /**
     * The average value of the column (only applies to `COLUMN_TYPE_NUMERICAL`).
     * @type {number|null}
     */
    const avg = useMemo(() => column?.avg || null, [column]);

    /**
     * The maximum value of the column (only applies to `COLUMN_TYPE_NUMERICAL`).
     * @type {number|null}
     */
    const max = useMemo(() => column?.max || null, [column]);

    /**
     * The minimum value of the column (only applies to `COLUMN_TYPE_NUMERICAL`).
     * @type {number|null}
     */
    const min = useMemo(() => column?.min || null, [column]);

    /**
     * The percentage of null values in the column.
     * @type {number|null}
     */
    const nullPercentage = useMemo(() => column?.nullPercentage, [column]);

    /**
     * The total number of null values in the column.
     * @type {number|null}
     * @returns {number|null} A count of null values (integer).
     */
    const nullCount = useMemo(
      () => Math.floor(count * nullPercentage),
      [nullPercentage, count],
    );

    /**
     * The percentage of non-null values in the column.
     * @type {number|null}
     * @return {number|null} A value between 0 and 1 representing completeness.
     */
    const completePercentage = useMemo(
      () => 1 - nullPercentage,
      [nullPercentage],
    );

    /**
     * The total number of non-null values in the column.
     * @type {number|null}
     * @return {number|null} A count of non-null values (integer).
     */
    const nonNullCount = useMemo(
      () => Math.floor(count * completePercentage),
      [count, completePercentage],
    );

    /**
     * The 25th percentile value of the column (only applies to `COLUMN_TYPE_NUMERICAL`).
     * @type {number|null}
     */
    const p25 = useMemo(() => column?.p25 || null, [column]);

    /**
     * The 50th percentile (median) value of the column (only applies to `COLUMN_TYPE_NUMERICAL`).
     * @type {number|null}
     */
    const p50 = useMemo(() => column?.p50 || null, [column]);

    /**
     * The 75th percentile value of the column (only applies to `COLUMN_TYPE_NUMERICAL`).
     * @type {number|null}
     */
    const p75 = useMemo(() => column?.p75 || null, [column]);

    /**
     * The standard deviation of the column (only applies to `COLUMN_TYPE_NUMERICAL`).
     * @type {number|null}
     */
    const std = useMemo(() => column?.std || null, [column]);

    /**
     * @function renameColumn
     *
     * Rename the column.
     * @param {string} name - The new name for the column.
     */
    const renameColumn = useCallback(
      (name) => {
        dispatch(updateColumnsRequest([{ id, name }]));
      },
      [dispatch, id],
    );

    /**
     * @function setColumnType
     *
     * Set the column type.
     * @param {string} columnType - The new column type.
     */
    const setColumnType = useCallback(
      (columnType) => dispatch(updateColumnsRequest([{ id, columnType }])),
      [dispatch, id],
    );

    /**
     * @function deleteColumn
     *
     * Delete the column.
     */
    const deleteColumn = useCallback(
      () => dispatch(deleteColumnsRequest([id])),
      [dispatch, id],
    );

    // Interaction state
    // --------------------------------------------------------------------

    /**
     * Whether the column is currently selected.
     * @type {boolean}
     */
    const isSelected = useSelector((state) => isColumnIdSelected(state, id));

    /**
     * Whether the column is currently hovered.
     * @type {boolean}
     */
    const isHovered = useSelector((state) => isColumnIdHovered(state, id));

    /**
     * Whether the column is currently being dragged.
     * @type {boolean}
     */
    const isDragging = useSelector((state) => isColumnIdDragging(state, id));

    /**
     * Whether the column is a valid drop target for a drag-and-drop operation.
     * This can depend, e.g. on whether the column belongs to the same table
     * as the dragged column.
     * @type {boolean}
     */
    const isDropTarget = useSelector((state) =>
      isColumnIdDropTarget(state, id),
    );

    /**
     * Whether the column is currently being hovered over as a drop target.
     * @type {boolean}
     */
    const isOver = useMemo(
      () => isDropTarget && isHovered,
      [isDropTarget, isHovered],
    );

    /**
     * Whether the column is currently focused.
     * @type {boolean}
     */
    const isFocused = useSelector((state) => isColumnIdFocused(state, id));

    /**
     * Whether the column is currently visible in the schema window.
     * @type {boolean}
     */
    const isVisible = useSelector((state) => isColumnIdVisible(state, id));

    /**
     * @function
     * Callback to hover the column (sets hovered state in Redux).
     * @returns {void}
     */
    const hoverColumn = useCallback(() => {
      dispatch(addToHoveredColumnIds(id));
    }, [dispatch, id]);

    /**
     * @function
     * Callback to unhover the column (removes hovered state in Redux).
     * @returns {void}
     */
    const unhoverColumn = useCallback(() => {
      dispatch(removeFromHoveredColumnIds(id));
    }, [dispatch, id]);

    /**
     * @function
     * Callback to unfocus the column (clears focused state in Redux).
     * @returns {void}
     */
    const unfocusColumn = useCallback(() => {
      dispatch(setFocusedColumnIds([]));
    }, [dispatch]);

    /**
     * @function
     * Callback to focus the column (sets focused state in Redux).
     * @returns {void}
     */
    const focusColumn = useCallback(() => {
      dispatch(setFocusedColumnIds([id]));
    }, [dispatch, id]);

    /**
     * @function
     * Callback to insert a new column into this column's table
     * @param {number} index - The index to insert the new column at
     * @param {string} name - The name of the new column
     * @param {string} columnType - The type of the new column
     * @param {any} fillValue - The value to fill the new column with (null for blank)
     * @returns {void}
     */
    const insertColumn = useCallback(
      (index, name, fillValue) => {
        dispatch(insertColumnsRequest([{ parentId, index, name, fillValue }]));
      },
      [dispatch, parentId],
    );

    return (
      <WrappedComponent
        id={id}
        // Identity and metadata
        operationIndex={operationIndex}
        parentId={parentId}
        index={index}
        databaseName={databaseName}
        name={name}
        columnType={columnType}
        count={count}
        approxUnique={approxUnique}
        duplicateCount={duplicateCount}
        uniquePercentage={uniquePercentage}
        topValues={topValues}
        renameColumn={renameColumn}
        setColumnType={setColumnType}
        deleteColumn={deleteColumn}
        // Statistical metadata
        modeValue={modeValue}
        modeCount={modeCount}
        avg={avg}
        max={max}
        min={min}
        nullPercentage={nullPercentage}
        nullCount={nullCount}
        completePercentage={completePercentage}
        nonNullCount={nonNullCount}
        p25={p25}
        p50={p50}
        p75={p75}
        std={std}
        // Interaction state
        isSelected={isSelected}
        isHovered={isHovered}
        isDragging={isDragging}
        isDropTarget={isDropTarget}
        isOver={isOver}
        isFocused={isFocused}
        isVisible={isVisible}
        hoverColumn={hoverColumn}
        unhoverColumn={unhoverColumn}
        focusColumn={focusColumn}
        unfocusColumn={unfocusColumn}
        insertColumn={insertColumn}
        {...props}
      />
    );
  }

  EnhancedComponent.displayName = `withColumnData(${
    WrappedComponent.displayName || WrappedComponent.name || "Component"
  })`;

  return EnhancedComponent;
}
