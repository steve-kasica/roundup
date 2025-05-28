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

function OperationBlockView({
  parentColumnCount,
  id,
  depth,
  columnCount,
  isFocused,
  isHovered,
  operationType,
  tableIds = [],
  childOperationId,
  onHover,
  onUnhover,
}) {
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
      {childOperationId ? (
        <EnhancedOperationBlockView
          id={childOperationId}
          parentColumnCount={columnCount}
        />
      ) : null}
      {tableIds.map((tableId) => (
        <TableBlockView
          key={tableId}
          id={tableId}
          isDraggable={false}
          parentOperationType={operationType}
          parentColumnCount={columnCount}
        />
      ))}
    </div>
  );
}

const EnhancedOperationBlockView = withOperationData(OperationBlockView);
export default EnhancedOperationBlockView;
