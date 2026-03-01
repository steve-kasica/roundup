/**
 * @fileoverview TableDropTarget Component
 *
 * A specialized drop zone component for accepting table drops and creating or updating
 * operations in the schema tree. This component handles the logic for adding tables
 * to the composite schema through different operation types (NO_OP, STACK, PACK).
 *
 * The component uses react-dnd for drop functionality and dispatches Redux actions
 * to create or update operations based on the current schema state.
 *
 * Drop scenarios:
 * 1. First table(s): Creates initial root operation (NO_OP or STACK)
 * 2. Adding to NO_OP: Converts to STACK or PACK operation
 * 3. Adding to existing operation: Appends tables to operation's children
 *
 * @module components/CompositeTableSchema/TableDropTarget
 *
 * @example
 * <TableDropTarget
 *   operationType={OPERATION_TYPE_STACK}
 *   disabled={false}
 *   sx={{ height: '50px' }}
 * >
 *   <AddIcon />
 * </TableDropTarget>
 */

/**
 * TableDropTarget.jsx
 *
 * Notes:
 *  - Table instance in the SourceTables component dispatch actions,
 *    only operationTypes are defined in this component
 */
import PropTypes from "prop-types";
import { useDrop } from "react-dnd";
import { useDispatch, useSelector } from "react-redux";
import {
  JOIN_PREDICATES,
  JOIN_TYPES,
  MATCH_STATS_DEFAULT,
  OPERATION_TYPE_NO_OP,
  OPERATION_TYPE_PACK,
  OPERATION_TYPE_STACK,
  selectRootOperation,
} from "../../slices/operationsSlice";
import { createOperationsRequest } from "../../sagas/createOperationsSaga/actions";
import { updateOperationsRequest } from "../../sagas/updateOperationsSaga/actions";
import {
  DRAG_TYPE_SOURCE_TABLE_ITEM,
  DRAG_TYPE_SOURCE_TABLE_ROW,
} from "../CustomDragLayer";
import StyledDropZone from "../ui/StyledDropZone";

/**
 * TableDropTarget Component
 *
 * A drop zone that accepts dragged tables and creates/updates operations accordingly.
 *
 * @component
 * @param {Object} props - Component props
 * @param {boolean} props.disabled - Whether the drop target is disabled
 * @param {('NO_OP'|'STACK'|'PACK')} props.operationType - Type of operation to create/update
 * @param {React.ReactNode} props.children - Content to display in the drop zone
 * @param {Object} [props.sx] - MUI sx styling props
 *
 * @returns {React.ReactElement} A styled drop zone that accepts table drags
 *
 * @description
 * Operation type behaviors:
 * - NO_OP: Used for initial schema setup (single table)
 * - STACK: Vertically stacks tables (union operation)
 * - PACK: Horizontally packs tables (join operation)
 *
 * Drop handling logic:
 * 1. Checks if drop was already handled by nested target
 * 2. Determines if creating new operation or updating existing
 * 3. Dispatches appropriate Redux action (create or update)
 * 4. Sets default join configuration for PACK operations
 *
 * Visual states:
 * - Shows hover effect when valid table is dragged over
 * - Displays disabled state when operations are blocked
 * - Indicates whether drop is allowed
 */
export default function TableDropTarget({
  disabled,
  operationType,
  children,
  sx,
}) {
  const dispatch = useDispatch();
  const rootOperation = useSelector(selectRootOperation);

  const [{ isOver, canDrop }, dropRef] = useDrop({
    accept: [DRAG_TYPE_SOURCE_TABLE_ROW, DRAG_TYPE_SOURCE_TABLE_ITEM],
    // eslint-disable-next-line no-unused-vars
    drop: ({ tableIds: draggedTableIds, type: dragType }, monitor) => {
      if (monitor.didDrop()) {
        return; // Already handled by a nested drop target
      }
      const tableCount = draggedTableIds.length;

      if (operationType === OPERATION_TYPE_NO_OP && rootOperation === null) {
        // Case: Initialize the first operation
        // If there is more than one table, default to a STACK operation
        dispatch(
          createOperationsRequest({
            operationData: [
              {
                operationType:
                  tableCount > 1 ? OPERATION_TYPE_STACK : OPERATION_TYPE_NO_OP,
                childIds: draggedTableIds,
              },
            ],
          }),
        );
      } else if (rootOperation?.operationType === OPERATION_TYPE_NO_OP) {
        // Case: first table added after schema initialized with only one table
        // Update the operation type and add the new table as a child
        // This allows the operation to evolve from a NO_OP to either PACK or STACK
        dispatch(
          updateOperationsRequest([
            {
              id: rootOperation.id,
              operationType,
              childIds: [...rootOperation.childIds, ...draggedTableIds],
              ...(operationType === OPERATION_TYPE_PACK && {
                joinPredicate: JOIN_PREDICATES["EQUALS"],
                joinType: JOIN_TYPES["FULL_OUTER"],
                joinKey1: null,
                joinKey2: null,
                matchStats: Object.fromEntries(MATCH_STATS_DEFAULT.entries()),
              }),
            },
          ]),
        );
      } else if (rootOperation?.operationType === operationType) {
        // Case: tables added to an existing operation of the same type
        dispatch(
          updateOperationsRequest([
            {
              id: rootOperation.id,
              childIds: [...rootOperation.childIds, ...draggedTableIds],
            },
          ]),
        );
      } else {
        // Case: tables added to an existing operation of a different type
        // Create a new operation with the existing root and the new table as children
        dispatch(
          createOperationsRequest([
            {
              operationType,
              childIds: [rootOperation.id, ...draggedTableIds],
            },
          ]),
        );
      }
    },
    canDrop: () => !disabled,
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  return (
    <StyledDropZone
      ref={dropRef}
      isOver={isOver}
      canDrop={canDrop}
      variant="default"
      size="auto"
      sx={sx}
    >
      {children}
    </StyledDropZone>
  );
}

TableDropTarget.propTypes = {
  operationType: PropTypes.string.isRequired,
  childIds: PropTypes.node,
};
