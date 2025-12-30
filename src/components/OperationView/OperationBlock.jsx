/**
 * @fileoverview OperationBlock Component
 *
 * A routing component that determines which specialized operation block to render
 * based on the operation type. This acts as a facade that delegates rendering to
 * type-specific components (StackOperationBlock, PackOperationBlock, or TableBlock).
 *
 * This component is part of the hierarchical schema visualization system and handles
 * the recursive rendering of nested operations and tables.
 *
 * @module components/OperationView/OperationBlock
 *
 * @example
 * <EnhancedOperationBlock
 *   id="operation-123"
 *   depth={1}
 *   maxDepth={3}
 *   colorScale={d3ScaleFunction}
 * />
 */

import {
  OPERATION_TYPE_PACK,
  OPERATION_TYPE_STACK,
} from "../../slices/operationsSlice";
import withOperationData from "../HOC/withOperationData";
import { EnhancedPackOperationBlock } from "../PackOperationView/PackOperationBlock";
import { EnhancedStackOperationBlock } from "../StackOperationView/StackOperationBlock";
import { EnhancedTableBlock } from "../TableView";

/**
 * OperationBlock Component
 *
 * Routes to the appropriate operation visualization based on type.
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.operationType - Type of operation (PACK/STACK/NO_OP)
 * @param {string[]} props.childIds - IDs of child elements
 * @param {number} props.depth - Current depth in operation tree
 * @param {number} props.maxDepth - Maximum depth for rendering
 * @param {Function} props.colorScale - D3 scale function for depth-based coloring
 * @param {Object} props....props - Additional props passed to child components
 *
 * @returns {React.ReactElement} The appropriate operation/table block component
 *
 * @description
 * Routing logic:
 * - STACK operation → EnhancedStackOperationBlock
 * - PACK operation → EnhancedPackOperationBlock
 * - NO_OP (single table) → EnhancedTableBlock with first child
 *
 * The component applies background color based on depth using the provided colorScale.
 */
const OperationBlock = ({
  operationType,
  childIds,
  depth,
  maxDepth,
  colorScale,
  ...props
}) => {
  if (operationType == OPERATION_TYPE_STACK) {
    return <EnhancedStackOperationBlock {...props} />;
  } else if (operationType === OPERATION_TYPE_PACK) {
    return <EnhancedPackOperationBlock {...props} />;
  } else {
    const backgroundColor = colorScale(depth);
    return (
      <EnhancedTableBlock
        id={childIds[0]}
        sx={{ height: "100%", backgroundColor }}
      />
    );
  }
};

OperationBlock.displayName = "Operation Block";

const EnhancedOperationBlock = withOperationData(OperationBlock);

EnhancedOperationBlock.displayName = "Enhanced Operation Block";

export { EnhancedOperationBlock, OperationBlock };
