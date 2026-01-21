/**
 * @fileoverview
 * Higher-Order Component (HOC) for injecting operation-related data and actions into
 * wrapped React components. This HOC connects to the Redux store to provide operation as well
 * as a suite of callbacks for manipulating operations, columns, and UI state.
 *
 * Exports a function `withOperationData` that takes a component and returns an enhanced
 * component with additional props and logic for operation management.
 *
 * @module components/HOC/withOperationData
 */

import { useSelector, useDispatch } from "react-redux";
import { useCallback, useMemo } from "react";
import {
  selectOperationsById,
  selectOperationDepthById,
  selectOperationChildRowCounts,
  selectRootOperationId,
  selectMaxOperationDepth,
  OPERATION_TYPE_PACK,
  DEFAULT_JOIN_PREDICATE,
  DEFAULT_JOIN_TYPE,
  MATCH_STATS_DEFAULT,
  selectOperationIndexById,
} from "../../slices/operationsSlice";
import {
  selectColumnIdsByParentId,
  selectSelectedColumnIdsByParentId,
} from "../../slices/columnsSlice";
import {
  selectFocusedObjectId,
  selectLoadingOperations,
  setFocusedColumnIds,
  setFocusedObjectId,
  setSelectedColumnIds,
  setVisibleColumnIds as setVisibleColumnsAction,
} from "../../slices/uiSlice";
import { updateOperationsRequest } from "../../sagas/updateOperationsSaga";
import {
  createColumnsRequest,
  CREATION_MODE_INSERTION,
} from "../../sagas/createColumnsSaga";

import { scaleOrdinal, scaleSequential } from "d3";
import { isTableId } from "../../slices/tablesSlice";
import { deleteColumnsRequest } from "../../sagas/deleteColumnsSaga/actions";
import {
  TREE_MAX_DEPTH,
  OPERATION_COLOR_PALETTE,
  TEXT_LUMINANCE_THRESHOLD,
} from "../../config";

/**
 * Higher-Order Component that injects operation data, column data, alert data, and
 * related action dispatchers into the wrapped component.
 *
 * Identity & Metadata:
 *  - `id` (string): The operation's unique identifier
 *  - `name` (string): Display name for the operation (falls back to operation type label if not set)
 *  - `databaseName` (string): Name of table in the database associated with this operation
 *  - `operationType` (string): Type of operation
 *  - `focusOperation` (function): Sets this operation as the focused operation
 *  - `setOperationType` (function): Changes the operation type
 *  - `setOperationName` (function): Updates the operation name
 *  - `swapTablePositions` (function): Swaps positions of two child tables
 *
 * Hierarchy & Structure:
 *  - `childIds` (array): IDs of child tables/operations
 *  - `depth` (number): Absolute depth of this operation from the root of the tree
 *  - `focusedDepth` (number|null): Relative depth from the currently focused operation
 *  - `maxDepth` (number): Maximum depth in the operation tree
 *  - `isRootOperation` (boolean): Whether this is the root operation
 *  - `colorScale` (function): `(depth) => color` - Function to get color based on depth
 *  - `isDarkBackground` (function): `(depth) => boolean` - Function to determine if background is dark at a given depth
 *
 * Sync & Materialization Status:
 *  - `isMaterialized` (boolean): Whether the operation is materialized
 *  - `isInSync` (boolean): Whether the operation is synchronized
 *  - `isLoading` (boolean): Whether this operation is currently loading
 *  - `materializeOperation` (function): Trigger a materialization request for this operation
 *
 * Column Data:
 *  - `columnIds` (array): All column IDs directly associated with this operation
 *  - `selectedColumnIds` (array): Currently selected column IDs
 *  - `childColumnIds` (array): Column IDs of child tables/operations
 *  - `selectedChildColumnIds` (array): Matrix of selected column IDs, each row represents a child table
 *  - `selectedChildColumnIdsSet` (Set): Set of all selected column IDs including those from child tables
 *  - `selectColumns` (columnIds): Selects specified columns
 *  - `selectAllChildColumns` (function): Selects all columns from child tables
 *  - `clearSelectedColumns` (function): Clears all selected columns
 *  - `deleteColumns` (function): Deletes specified columns
 *  - `setVisibleColumns` (function): Sets which columns are visible
 *  - `focusColumns` (function): Sets focused columns
 *  - `insertColumnIntoChildAtIndex` (function): Inserts a new column into a child table at specified index
 *
 * Row Data:
 *  - `childRowCounts` (Map): Map of row counts for child tables/operations, keyed by child ID
 *
 * Interaction State:
 *  - `isFocused` (boolean): Whether this operation is currently focused
 *
 *
 * @function
 * @param {React.ComponentType} WrappedComponent - The component to enhance.
 * @returns {React.ComponentType} Enhanced component with operation-related props.
 *
 */

export default function withOperationData(WrappedComponent) {
  function EnhancedComponent({ id, ...props }) {
    const dispatch = useDispatch();
    const operation = useSelector((state) => selectOperationsById(state, id));

    // Identity & Metadata
    // -------------------------------------------------------------

    // The name database table associated with this operation
    const databaseName = useMemo(
      () => operation.databaseName,
      [operation.databaseName],
    );

    // The type of this operation
    const operationType = useMemo(
      () => operation.operationType,
      [operation.operationType],
    );

    // The display name of this operation
    const name = useMemo(() => {
      if (operation.name && operation.name.trim().length > 0) {
        return operation.name;
      } else {
        const operationLabel = operationType
          ? operationType.charAt(0).toUpperCase() +
            operationType.slice(1) +
            " op."
          : "Op.";
        return operationLabel;
      }
    }, [operation.name, operationType]);

    // Function to change the operation name (not database name)
    const setOperationName = useCallback(
      (name) => {
        dispatch(updateOperationsRequest({ operationUpdates: [{ id, name }] }));
      },
      [dispatch, id],
    );

    // Function to change the operation type
    const setOperationType = useCallback(
      (nextOperationType) =>
        dispatch(
          updateOperationsRequest({
            operationUpdates: [
              {
                id,
                operationType: nextOperationType,
                // Reset join parameters if changing away from PACK
                ...(nextOperationType === OPERATION_TYPE_PACK
                  ? {
                      joinKey1: null,
                      joinKey2: null,
                      joinPredicate: DEFAULT_JOIN_PREDICATE,
                      joinType: DEFAULT_JOIN_TYPE,
                      matchStats: Object.fromEntries(
                        MATCH_STATS_DEFAULT.entries(),
                      ),
                    }
                  : {
                      joinKey1: undefined,
                      joinKey2: undefined,
                      joinPredicate: undefined,
                      joinType: undefined,
                      matchStats: undefined,
                    }),
              },
            ],
          }),
        ),
      [dispatch, id],
    );

    const operationIndex = useSelector((state) =>
      selectOperationIndexById(state, id),
    );

    // Hierarchy & Structure
    // -------------------------------------------------------------

    // The IDs of child tables/operations
    const childIds = useMemo(
      () => operation.childIds || [],
      [operation.childIds],
    );

    // The absolute depth of this operation from the root of the tree
    // Dependencies (via `selectOperationDepthById`):
    //  - `state.operations.rootOperationId`,
    //  - `state.operations.byId`,
    //  - `operation.id`
    const depth = useSelector((state) => selectOperationDepthById(state, id));

    // The relative depth of this operation from the currently focused operation
    // TODO: if this is glitchy, then just create a new selector and test it.
    // Dependencies:
    //  - `ui.focusedObjectId` (via `selectFocusedObjectid`)
    //  - via `selectOperationDepthById`:
    //    - `operations.rootOperationId`
    //    - `operations.byId`
    const focusedDepth = useSelector((state) => {
      const focusedOperationId = selectFocusedObjectId(state);
      if (isTableId(focusedOperationId)) {
        return null;
      } else {
        const focusedOperationDepth = selectOperationDepthById(
          state,
          focusedOperationId,
        );
        return depth - focusedOperationDepth;
      }
    });

    // The maximum depth of the operation tree
    // Dependencies (via `selectMaxOperationDepth`):
    //  - `state.operations.rootOperationId`
    //  - `state.operations.byId`
    const maxDepth = useSelector(selectMaxOperationDepth);

    // The root operation ID
    // Dependencies: `state.operations.rootOperationId`
    const isRootOperation = useSelector((state) => {
      return id === selectRootOperationId(state);
    });

    // TODO: memoize?
    const allOperationIds = useSelector((state) => {
      return state.operations.allIds;
    });

    // Function to get a color based on depth within the operation tree
    const colorScale = useCallback(
      (operationId) => {
        const scale = scaleOrdinal(allOperationIds, OPERATION_COLOR_PALETTE);
        // const scale = scaleOrdinal(, )
        // const scale = scaleSequential([5, 0], OPERATION_COLOR_PALETTE);
        // return scale(depth);
        return scale(operationId);
      },
      [allOperationIds],
    );

    // Simple algorithm to determine if text should be light or dark based on background color
    const isDarkBackground = useCallback(
      (depth) => {
        const backgroundColor = colorScale(depth);
        const rgb = parseInt(backgroundColor.slice(1), 16); // Convert hex to integer
        const r = (rgb >> 16) & 0xff;
        const g = (rgb >> 8) & 0xff;
        const b = rgb & 0xff;
        const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
        return luminance < TEXT_LUMINANCE_THRESHOLD;
      },
      [colorScale],
    );

    // Sync & Materialization Status
    // -------------------------------------------------------------

    // is the operation materialized?
    const isMaterialized = useMemo(
      () => operation.isMaterialized,
      [operation.isMaterialized],
    );

    // is the materialized operation in sync with the schema?
    const isInSync = useMemo(() => operation.isInSync, [operation.isInSync]);

    // is the operation Id in the loading operations array?
    // Dependencies: `ui.loadingOperations`
    const isLoading = useSelector((state) => {
      return selectLoadingOperations(state).includes(id);
    });

    // Column Data
    // -------------------------------------------------------------

    // All column IDs associated directly with this operation
    const columnIds = useMemo(
      () => operation.columnIds || [],
      [operation.columnIds],
    );

    /**
     * Column IDs of child tables/operations
     * @type {Array<Array<string>>}
     */
    const childColumnIds = useSelector((state) =>
      selectColumnIdsByParentId(state, childIds),
    );

    /**
     * Matrix of selected column IDs, each row represents a child table
     * Is dependent upon `state.ui.selectedColumnIds`
     * @type {Array<Array<string>>}
     */
    const selectedChildColumnIds = useSelector((state) =>
      selectSelectedColumnIdsByParentId(state, childIds),
    );

    /**
     * Set of all selected column IDs including those from child tables
     * @type {Set<string>}
     */
    const selectedChildColumnIdsSet = useMemo(() => {
      return new Set(selectedChildColumnIds.flat());
    }, [selectedChildColumnIds]);

    // Column objects for all columns associated directly with this operation
    // TODO: should this be a selector of should the selector draw straight
    // from the ui source, then we memoize a calculation upon it?
    const selectedColumnIds = useSelector((state) =>
      selectSelectedColumnIdsByParentId(state, id),
    );

    /**
     * The currently focused object ID from the UI state
     * @type {string|null}
     */
    const focusedObjectId = useSelector(selectFocusedObjectId);

    const childRowCounts = useSelector((state) =>
      selectOperationChildRowCounts(state, id),
    );

    const isFocused = focusedObjectId === id;

    // Define callback functions used by all operation types
    // ----------------------------------------------------------------------------
    const setVisibleColumns = useCallback(
      (columnIds) => {
        dispatch(setVisibleColumnsAction(columnIds));
      },
      [dispatch],
    );

    const selectColumns = useCallback(
      (columnIds) => dispatch(setSelectedColumnIds(columnIds)),
      [dispatch],
    );

    const clearSelectedColumns = useCallback(() => {
      dispatch(setSelectedColumnIds([]));
    }, [dispatch]);

    const insertColumnIntoChildAtIndex = useCallback(
      (childId, targetIndex, fillValue, name) => {
        dispatch(
          createColumnsRequest({
            mode: CREATION_MODE_INSERTION,
            columnLocations: [
              { parentId: childId, index: targetIndex, fillValue, name },
            ],
          }),
        );
      },
      [dispatch],
    );

    const focusColumns = useCallback(
      (colIds) => dispatch(setFocusedColumnIds(colIds)),
      [dispatch],
    );

    const swapTablePositions = useCallback(
      (aIndex, bIndex) => {
        const updatedChildren = [...(childIds || [])];
        // Swap the two table IDs
        [updatedChildren[aIndex], updatedChildren[bIndex]] = [
          updatedChildren[bIndex],
          updatedChildren[aIndex],
        ];

        dispatch(
          updateOperationsRequest({
            operationUpdates: [
              {
                id,
                childIds: updatedChildren,
                // If join keys are set, we may need to swap them as well
                ...(operation.operationType === OPERATION_TYPE_PACK &&
                operation.joinKey1 &&
                operation.joinKey2
                  ? {
                      joinKey1: operation.joinKey2,
                      joinKey2: operation.joinKey1,
                    }
                  : {}),
              },
            ],
          }),
        );
      },
      [dispatch, id, childIds, operation.joinKey1, operation.joinKey2],
    );

    const deleteColumns = useCallback(
      (columnIdsToDelete) => {
        dispatch(
          deleteColumnsRequest({
            columnIds: columnIdsToDelete,
            recurse: true,
            deleteFromDatabase: true,
          }),
        );
      },
      [dispatch],
    );

    const materializeOperation = useCallback(
      () =>
        dispatch(
          updateOperationsRequest({
            operationUpdates: [{ id, isMaterialized: null }],
          }),
        ),
      [dispatch, id],
    );

    /**
     * Sets the currently focused operation by dispatching the setFocusedObjectId action
     * with the provided operation ID.
     *
     * @function
     * @returns {void}
     */
    const focusOperation = useCallback(
      () => dispatch(setFocusedObjectId(id)),
      [dispatch, id],
    );

    /**
     * Selects all columns from the child tables of this operation.
     *
     * @function
     * @returns {void}
     */
    const selectAllChildColumns = useCallback(() => {
      selectColumns(childColumnIds.flat());
    }, [selectColumns, childColumnIds]);

    return (
      <WrappedComponent
        // Identity & Metadata
        id={id}
        name={name}
        databaseName={databaseName}
        operationType={operationType}
        setOperationType={setOperationType}
        setOperationName={setOperationName}
        swapTablePositions={swapTablePositions}
        operationIndex={operationIndex}
        // Hierarchy & Structure
        childIds={childIds}
        depth={depth}
        focusedDepth={focusedDepth}
        maxDepth={maxDepth}
        isRootOperation={isRootOperation}
        colorScale={colorScale}
        isDarkBackground={isDarkBackground}
        // Sync & Materialization Status
        isMaterialized={isMaterialized}
        isInSync={isInSync}
        isLoading={isLoading}
        materializeOperation={materializeOperation}
        // Column Data
        columnIds={columnIds} // All column IDs associated with this operation
        childColumnIds={childColumnIds} // ColumnIDs of operation's child tables (not hidden)
        selectedColumnIds={selectedColumnIds}
        selectedChildColumnIds={selectedChildColumnIds} // A matrix of column IDs, each row is a child table
        selectedChildColumnIdsSet={selectedChildColumnIdsSet} // a Set of all selected column IDs, including those from child tables
        selectColumns={selectColumns}
        selectAllChildColumns={selectAllChildColumns}
        clearSelectedColumns={clearSelectedColumns}
        deleteColumns={deleteColumns}
        setVisibleColumns={setVisibleColumns}
        focusColumns={focusColumns}
        insertColumnIntoChildAtIndex={insertColumnIntoChildAtIndex}
        // Row Data
        childRowCounts={childRowCounts}
        // Interaction state
        isFocused={isFocused}
        focusOperation={focusOperation}
        // Pass along props directly from the parent component
        {...props}
      />
    );
  }

  return EnhancedComponent;
}
