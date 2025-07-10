/**
 * CompositeTableSchema/TableView.jsx
 * -----------------------------------------------------------------
 * A visual representation of **source table** data in the
 * **Table Tree**.
 */
import ColumnView from "./ColumnView.jsx";
import { OPERATION_TYPE_STACK } from "../../slices/operationsSlice/Operation.js";
import withTableData from "../HOC/withTableData.jsx";
import PropTypes from "prop-types";

function TableView({
  // props via withTableData
  name,
  selectedColumnIds,
  isHovered,
  isDragging,
  isPressed,
  isFocused,

  // props passed via OperationBlockView
  parentOperationType,
  parentColumnCount,
}) {
  const columnCount = selectedColumnIds.length;

  const ticks = Array.from(
    {
      length:
        parentOperationType === OPERATION_TYPE_STACK
          ? parentColumnCount
          : columnCount,
    },
    (_, i) => (i < selectedColumnIds.length ? selectedColumnIds[i] : null)
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
        {name} <span className="column-count">({columnCount})</span>
      </div>
      {ticks.map((columnId, index) => (
        <ColumnView
          key={`${columnId}-${index}`} // Ensure unique key even when columnId is null
          id={columnId}
        />
      ))}
    </div>
  );
}

TableView.propTypes = {
  name: PropTypes.string.isRequired,
  selectedColumnIds: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  ).isRequired,
  isHovered: PropTypes.bool,
  isDragging: PropTypes.bool,
  isPressed: PropTypes.bool,
  isFocused: PropTypes.bool,
  parentOperationType: PropTypes.string,
  parentColumnCount: PropTypes.number,
};

const EnhancedTableView = withTableData(TableView);
export default EnhancedTableView;
