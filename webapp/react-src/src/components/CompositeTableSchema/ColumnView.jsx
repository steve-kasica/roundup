import withColumnData from "../HOC/withColumnData";
import PropTypes from "prop-types";

function ColumnView({
  isNull,
  isSelected,
  isLoading,
  isHovered,
  isDragging,
  isOver,
  error,
}) {
  const className = [
    "ColumnView",
    isNull ? "null" : undefined,
    isSelected ? "selected" : undefined,
    isLoading ? "loading" : undefined,
    isHovered ? "hover" : undefined,
    isDragging ? "dragged" : undefined,
    isOver ? "over" : undefined,
    error ? "error" : undefined,
  ]
    .filter(Boolean)
    .join(" ");

  return <div className={className}></div>;
}

ColumnView.propTypes = {
  isNull: PropTypes.bool,
  isSelected: PropTypes.bool,
  isLoading: PropTypes.bool,
  isHovered: PropTypes.bool,
  isDragging: PropTypes.bool,
  isOver: PropTypes.bool,
  error: PropTypes.any,
};

const EnhancedColumnView = withColumnData(ColumnView);
export default EnhancedColumnView;
