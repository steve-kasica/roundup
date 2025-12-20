/**
 * TableDropTarget.jsx
 *
 * Notes:
 *  - Table instance in the SourceTables component dispatch actions,
 *    only operationTypes are defined in this component
 */
import PropTypes from "prop-types";
import { forwardRef } from "react";
import { useDrop } from "react-dnd";
import { styled } from "@mui/material/styles";
import { Box } from "@mui/material";
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
          })
        );
      } else if (rootOperation?.operationType === OPERATION_TYPE_NO_OP) {
        // Case: first table added after schema initialized with only one table
        // Update the operation type and add the new table as a child
        // This allows the operation to evolve from a NO_OP to either PACK or STACK
        dispatch(
          updateOperationsRequest({
            operationUpdates: [
              {
                id: rootOperation.id,
                operationType,
                childIds: [...rootOperation.childIds, ...draggedTableIds],
                ...(operationType === OPERATION_TYPE_PACK && {
                  joinPredicate: JOIN_PREDICATES["EQUALS"],
                  joinType: JOIN_TYPES["FULL_OUTER"],
                  joinKey1: null,
                  joinKey2: null,
                  matchStats: { ...MATCH_STATS_DEFAULT },
                }),
              },
            ],
          })
        );
      } else if (rootOperation?.operationType === operationType) {
        // Case: tables added to an existing operation of the same type
        dispatch(
          updateOperationsRequest({
            operationUpdates: [
              {
                id: rootOperation.id,
                childIds: [...rootOperation.childIds, ...draggedTableIds],
              },
            ],
          })
        );
      } else {
        // Case: tables added to an existing operation of a different type
        // Create a new operation with the existing root and the new table as children
        dispatch(
          createOperationsRequest({
            operationData: [
              {
                operationType,
                childIds: [rootOperation.id, ...draggedTableIds],
              },
            ],
          })
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
