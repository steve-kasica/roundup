/**
 * CompositeTableSchema/Operation.jsx
 * -----------------------------------------------------------------
 * A visual representation of an operation in the **Output Schema**
 * It is a container for **Source Tables** and/or other **Operations**.
 * When an **Operation** is present in `node.children`, it recursively
 * calls itself. Only **SourceTables** can be leaves in the
 * **Table Tree**, by design.
 */

import TableBlockView from "./TableBlockView";
import withOperationData from "../HOC/withOperationData";
import { isOperationId } from "../../data/slices/operationsSlice";
import { isTableId } from "../../data/slices/tablesSlice";
import PropTypes from "prop-types";

function OperationBlockView({
  // props via withOperationData
  depth,
  columnCount,
  isFocused,
  isHovered,
  operationType,
  childrenIds,

  // Props passed recusrively via parent operation
  parentColumnCount = 0,
}) {
  const childOperationIds = childrenIds.filter(isOperationId);
  const childTableIds = childrenIds.filter(isTableId);

  const className = [
    "operation",
    operationType,
    `depth-${depth}`,
    isFocused ? "focused" : "",
    isHovered ? "hover" : "",
  ].filter(Boolean);

  return (
    <div
      className={className.join(" ")}
      style={{ flexBasis: `${(columnCount / parentColumnCount) * 100}%` }}
    >
      {childOperationIds.length > 0
        ? childOperationIds.map((childOperationId) => (
            <EnhancedOperationBlockView
              key={childOperationId}
              id={childOperationId}
              parentColumnCount={columnCount}
            />
          ))
        : null}
      {childTableIds.length > 0
        ? childTableIds.map((tableId) => (
            <TableBlockView
              key={tableId}
              id={tableId}
              isDraggable={false}
              parentOperationType={operationType}
              parentColumnCount={columnCount}
            />
          ))
        : null}
    </div>
  );
}

const EnhancedOperationBlockView = withOperationData(OperationBlockView);

OperationBlockView.propTypes = {
  depth: PropTypes.number,
  columnCount: PropTypes.number.isRequired,
  isFocused: PropTypes.bool,
  isHovered: PropTypes.bool,
  operationType: PropTypes.string.isRequired,
  childrenIds: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  ).isRequired,
  parentColumnCount: PropTypes.number,
};

export default EnhancedOperationBlockView;
