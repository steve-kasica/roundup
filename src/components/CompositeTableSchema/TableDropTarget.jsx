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
  OPERATION_TYPE_NO_OP,
  OPERATION_TYPE_STACK,
  selectOperation,
  selectRootOperation,
} from "../../slices/operationsSlice";
import { createOperationsRequest } from "../../sagas/createOperationsSaga/actions";
import { updateOperationsRequest } from "../../sagas/updateOperationsSaga/actions";
import {
  DRAG_TYPE_SOURCE_TABLE_ITEM,
  DRAG_TYPE_SOURCE_TABLE_ROW,
} from "../CustomDragLayer";

const ForwardedBox = forwardRef((props, ref) => <Box ref={ref} {...props} />);
ForwardedBox.displayName = "ForwardedBox";

const DropZone = styled(ForwardedBox, {
  shouldForwardProp: (prop) =>
    !["isOver", "canDrop", "variant", "size"].includes(prop),
})(({ theme, isOver, canDrop, variant = "default", size = "medium" }) => {
  // Base styles
  let styles = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    border: "1px dashed #000",
    color: "#999",
    transition: "all 0.2s ease-in-out",
    position: "relative",
    overflow: "hidden",
  };

  // Size variations
  const sizeStyles = {
    small: {
      height: "60px",
      minHeight: "60px",
    },
    medium: {
      height: "100px",
      minHeight: "100px",
    },
    large: {
      height: "150px",
      minHeight: "150px",
    },
    auto: {
      height: "100%",
      minHeight: "30px",
    },
  };

  // Apply size styles
  styles = { ...styles, ...sizeStyles[size] };

  // Variant styles
  const variantStyles = {
    default: {
      backgroundColor: "inherit",
      borderColor: "#ddd",
    },
    primary: {
      backgroundColor: "rgba(25, 118, 210, 0.05)",
      borderColor: theme.palette.primary.main,
      color: theme.palette.primary.main,
    },
    secondary: {
      backgroundColor: "rgba(156, 39, 176, 0.05)",
      borderColor: theme.palette.secondary.main,
      color: theme.palette.secondary.main,
    },
    success: {
      backgroundColor: "rgba(76, 175, 80, 0.05)",
      borderColor: "#4caf50",
      color: "#2e7d32",
    },
    warning: {
      backgroundColor: "rgba(255, 152, 0, 0.05)",
      borderColor: "#ff9800",
      color: "#f57c00",
    },
    error: {
      backgroundColor: "rgba(244, 67, 54, 0.05)",
      borderColor: "#f44336",
      color: "#d32f2f",
    },
  };

  // Apply variant styles
  styles = { ...styles, ...variantStyles[variant] };

  // Can drop state styles (when something is being dragged and can be dropped)
  if (canDrop && !isOver) {
    styles = {
      ...styles,
      borderColor:
        variant === "default" ? "#1976d2" : variantStyles[variant].borderColor,
      borderStyle: "dashed",
      borderWidth: "2px",
      backgroundColor:
        variant === "default"
          ? "rgba(25, 118, 210, 0.02)"
          : `${variantStyles[variant].borderColor}08`,
      color: variant === "default" ? "#1976d2" : variantStyles[variant].color,
    };
  }

  // Active state styles (when dragging over)
  if (canDrop && isOver) {
    styles = {
      ...styles,
      backgroundColor: "tomato",
      borderColor:
        variant === "default" ? "tomato" : variantStyles[variant].borderColor,
      borderStyle: "solid",
      borderWidth: "2px",
      transform: "scale(1.02)",
      boxShadow: `0 4px 12px ${
        variant === "default"
          ? "rgba(255, 99, 71, 0.3)"
          : `${variantStyles[variant].borderColor}40`
      }`,
      color: variant === "default" ? "#fff" : variantStyles[variant].color,
    };
  }

  return styles;
});

export default function TableDropTarget({ operationType, children }) {
  const dispatch = useDispatch();
  const rootOperation = useSelector((state) => {
    const rootId = selectRootOperation(state);
    return selectOperation(state, rootId);
  });

  const [{ isOver, canDrop }, dropRef] = useDrop({
    accept: [DRAG_TYPE_SOURCE_TABLE_ROW, DRAG_TYPE_SOURCE_TABLE_ITEM],
    // eslint-disable-next-line no-unused-vars
    drop: ({ tableIds: draggedTableIds, type: dragType }, monitor) => {
      if (monitor.didDrop()) {
        return; // Already handled by a nested drop target
      }
      const tableCount = draggedTableIds.length;
      if (
        operationType === OPERATION_TYPE_NO_OP &&
        rootOperation === undefined
      ) {
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
                children: [...rootOperation.children, ...draggedTableIds],
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
                children: [...rootOperation.children, ...draggedTableIds],
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
    canDrop: () => true,
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  return (
    <DropZone
      ref={dropRef}
      isOver={isOver}
      canDrop={canDrop}
      variant="default"
      size="auto"
    >
      {children}
    </DropZone>
  );
}

TableDropTarget.propTypes = {
  operationType: PropTypes.string.isRequired,
  children: PropTypes.node,
};
