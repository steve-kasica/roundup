import { useDispatch, useSelector } from "react-redux";
import PropTypes from "prop-types";
import { useCallback, useMemo } from "react";

import {
  selectOperationDepth,
  selectOperation,
} from "../../slices/operationsSlice";
import { setPeekedTable } from "../../slices/uiSlice";
import {
  selectColumnById,
  selectColumnIdsByTableId,
  selectRemovedColumnIdsByTableId,
  setHoveredColumns,
} from "../../slices/columnsSlice";
import {
  selectHoveredTable,
  clearHoveredTable,
  setHoveredTable,
  selectSelectedTables,
  changeTablesName,
  selectTablesById,
  setSelectedTables,
  setTablesAttribute,
  removeFromSelectedTables,
} from "../../slices/tablesSlice";

import { deleteTablesRequest } from "../../sagas/deleteTablesSaga";
import { updateTablesRequest } from "../../sagas/updateTablesSaga";
import { createColumnsRequest } from "../../sagas/createColumnsSaga";
import { updateColumnsRequest } from "../../sagas/updateColumnsSaga";

export default function withTableData(WrappedComponent) {
  const componentName =
    WrappedComponent.displayName || WrappedComponent.name || "Component";

  function EnhancedComponent({ id, ...props }) {
    const dispatch = useDispatch();

    try {
      // Get table data from the Redux store
      const table = useSelector((state) => selectTablesById(state, id));
      const selectedTables = useSelector(selectSelectedTables) || [];
      const hoveredTable = useSelector(selectHoveredTable);

      // Get columnIds associated with this table, both active and "removed"
      const removedColumnIds = useSelector((state) =>
        selectRemovedColumnIdsByTableId(state, id)
      );

      // Columns associated with this specific table
      const columns = useSelector((state) =>
        selectColumnIdsByTableId(state, id).map((colId) =>
          selectColumnById(state, colId)
        )
      );

      // Active columns are those that are not excluded
      // This array is exported as props
      const activeColumnIds = useMemo(
        () =>
          columns.filter(({ isExcluded }) => !isExcluded).map(({ id }) => id),
        [columns]
      );

      // Selected columns are active columns that are also selected
      // This array is exported as props
      const selectedColumnIds = useMemo(
        () =>
          columns
            .filter(({ isExcluded, isSelected }) => !isExcluded && isSelected)
            .map(({ id }) => id),
        [columns]
      );

      // Selected column names are the `columnNames` in the DB for selected columns
      // used in some DB hooks. This array is exported as props
      const selectedColumnNames = useMemo(
        () =>
          columns
            .filter(({ isExcluded, isSelected }) => !isExcluded && isSelected)
            .map(({ columnName }) => columnName),
        [columns]
      );

      // Similarly, hovered columns are active columns that are also hovered
      // This array is exported as props
      const hoveredColumnIds = useMemo(
        () =>
          columns
            .filter(({ isExcluded, isHovered }) => !isExcluded && isHovered)
            .map(({ id }) => id),
        [columns]
      );

      // Get related operation data from the Redux store, if any
      const parentOperation = useSelector((state) =>
        table.operationId ? selectOperation(state, table.operationId) : null
      );
      const depth = useSelector((state) =>
        table.operationId
          ? selectOperationDepth(state, table.operationId)
          : null
      );

      const isInSchema = table.operationId !== null;
      const isHovered = hoveredTable === id;
      const isSelected = selectedTables.includes(id);

      // Functions to handle interactions
      const handleSelectColumns = useCallback(
        (selectedColumnIds, unselectedColumnIds) => {
          dispatch(
            updateColumnsRequest({
              columnUpdates: [
                ...selectedColumnIds.map((id) => ({ id, isSelected: true })),
                ...unselectedColumnIds.map((id) => ({ id, isSelected: false })),
              ],
            })
          );
        },
        [dispatch]
      );

      const hoverColumn = useCallback(
        (columnIds) => {
          dispatch(setHoveredColumns(columnIds));
        },
        [dispatch]
      );

      const unhoverColumn = useCallback(() => {
        dispatch(setHoveredColumns([]));
      }, [dispatch]);

      return (
        <WrappedComponent
          {...props}
          // Table properties
          table={table}
          parentOperation={parentOperation} // TODO: should only pass Ids
          depth={depth}
          columnCount={activeColumnIds.length}
          // Properties derived from table's columns
          activeColumnIds={activeColumnIds}
          selectedColumnIds={selectedColumnIds}
          selectedColumnNames={selectedColumnNames} // necessary for DB hooks
          hoveredColumnIds={hoveredColumnIds} // Only hovered columnIDs in this table
          removedColumnIds={removedColumnIds}
          // Interaction state
          isHovered={isHovered}
          isInSchema={isInSchema}
          isSelected={isSelected}
          isFocused={parentOperation ? true : false}
          // Interaction handlers
          selectColumns={handleSelectColumns}
          hoverColumn={hoverColumn}
          unhoverColumn={unhoverColumn}
          swapColumns={(target, source) => {
            const updatedColumnIds = [...activeColumnIds];
            const sourceIndex = updatedColumnIds.indexOf(source);
            const targetIndex = updatedColumnIds.indexOf(target);
            if (sourceIndex === -1 || targetIndex === -1) return; // Invalid indices

            // Remove source columnId from its original position
            updatedColumnIds.splice(sourceIndex, 1);
            // Insert source columnId at the target position
            updatedColumnIds.splice(targetIndex, 0, source);

            // Update the table's columnIds in the store
            dispatch(updateTablesRequest({ id, columnIds: updatedColumnIds }));
          }}
          insertColumn={(index) => {
            dispatch(createColumnsRequest({ tableId: id, index }));
          }}
          excludeColumns={(columnIds) => {
            dispatch(
              updateColumnsRequest({
                columnUpdates: columnIds.map((colId) => ({
                  id: colId,
                  isExcluded: true,
                  isSelected: false, // Excluding also unselects
                })),
              })
            );
          }}
          // Table action handlers
          onHover={() => dispatch(setHoveredTable(id))} // TODO: remove
          onUnhover={() => dispatch(clearHoveredTable())} // TODO: remove
          hoverTable={() => dispatch(setHoveredTable(id))}
          unhoverTable={() => dispatch(clearHoveredTable())}
          // removeTableFromSchema={() => {
          //   // TODO
          //   if (isInSchema) {
          //     dispatch(
          //       deleteTablesRequest({
          //         operationIds: [table.operationId],
          //         tableIds: [id],
          //       })
          //     );
          //   }
          // }}
          setTableSelection={(ids) => dispatch(setSelectedTables(ids))}
          unselectTable={() => dispatch(removeFromSelectedTables(id))}
          peekTable={() => dispatch(setPeekedTable(id))}
          renameTable={(newNames) =>
            dispatch(changeTablesName({ ids: id, newNames }))
          }
          dropTable={() => dispatch(deleteTablesRequest(id))} // @depricate
          deleteTable={() => dispatch(deleteTablesRequest(id))}
          setKeyColumn={(columnId) =>
            dispatch(
              setTablesAttribute({
                ids: id,
                attribute: "keyColumnId",
                value: columnId,
              })
            )
          }
          // addSelectedTablesToSchema={(operationType) =>
          //   dispatch(
          //     addTablesToSchemaRequest({
          //       tableIds: selectedTables,
          //       operationType,
          //     })
          //   )
          // }
        />
      );
    } catch (error) {
      // Enhanced error with component context
      const enhancedError = new Error(
        `Error in withTableData HOC wrapping ${componentName} (table id: ${id}): ${error.message}`
      );
      enhancedError.originalError = error;
      enhancedError.componentName = componentName;
      enhancedError.tableId = id;
      enhancedError.stack = error.stack;

      console.error(`[withTableData HOC] Error in ${componentName}:`, {
        componentName,
        tableId: id,
        originalError: error,
        props: props,
      });

      throw enhancedError;
    }
  }

  EnhancedComponent.propTypes = {
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    isDraggable: PropTypes.bool,
  };

  // Set display name for better debugging in React DevTools
  EnhancedComponent.displayName = `withTableData(${componentName})`;

  return EnhancedComponent;
}

withTableData.propTypes = {
  WrappedComponent: PropTypes.elementType.isRequired,
};

// EnhancedComponent prop types
export const EnhancedComponentPropTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};
