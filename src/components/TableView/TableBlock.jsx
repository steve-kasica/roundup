/* eslint-disable react/prop-types */

import { EnhancedColumnTick } from "../ColumnViews";
import { OPERATION_TYPE_STACK } from "../../slices/operationsSlice/Operation.js";
import withTableData from "./withTableData.jsx";

function TableBlock({
  // props via withTableData
  table,
  columnCount = 0,
  columnIds = [],
  isHovered,
  isDragging,
  isPressed,
  isFocused,

  // props passed via OperationBlockView
  parentOperationType,
  parentColumnCount,
}) {
  const ticks = Array.from(
    {
      length:
        parentOperationType === OPERATION_TYPE_STACK
          ? parentColumnCount
          : columnCount,
    },
    (_, i) => (i < columnCount ? columnIds[i] : null)
  );

  const className = [
    "table",
    isFocused ? "focused" : undefined,
    isHovered ? "hover" : undefined,
    isDragging ? "dragging" : undefined,
    isPressed ? "pressed" : undefined,
  ].filter(Boolean);

  return (
    <div
      className={className.join(" ")}
      style={{ flexBasis: `${(columnCount / parentColumnCount) * 100}%` }}
    >
      <div className="label">
        {table.name} <span className="column-count">({columnCount})</span>
      </div>
      {/* This should be children */}
      {ticks.map((columnId, index) => (
        <EnhancedColumnTick
          key={`${columnId}-${index}`} // Ensure unique key even when columnId is null
          id={columnId}
        />
      ))}
    </div>
  );
}

TableBlock.displayName = "TableBlock";

const EnhancedTableBlock = withTableData(TableBlock);

EnhancedTableBlock.displayName = "EnhancedTableBlock";

export { TableBlock, EnhancedTableBlock };
