import { useState } from "react";
import ColumnView from "./ColumnView";
import PropTypes from "prop-types";

// Really, all this component does is sync scroll between column views
export default function LowLevelView({
  columnIds,
  onCellClick,
  dragMode,
  setDragMode,
  valueCount = 10,
  tableIds,
}) {
  const [scrollTop, setScrollTop] = useState(0);

  // Handler to sync scroll position
  const handleScroll = (newScrollTop) => {
    setScrollTop(newScrollTop);
  };

  return (
    <>
      {columnIds.map((id) => (
        <ColumnView
          key={id}
          id={id}
          limit={valueCount}
          onCellClick={onCellClick}
          scrollTop={scrollTop}
          onScroll={handleScroll}
          dragMode={dragMode}
          setDragMode={setDragMode}
        />
      ))}
    </>
  );
}

LowLevelView.propTypes = {
  columnIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  tableIds: PropTypes.arrayOf(PropTypes.string).isRequired,
};
