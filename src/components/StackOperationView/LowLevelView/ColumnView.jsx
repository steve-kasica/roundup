import { useEffect, useState, useRef } from "react";
import { getColumnValues } from "../../../lib/duckdb";
import PropTypes from "prop-types";
import { Box, Typography } from "@mui/material";
import ColumnContainer from "../ColumnContainer";
import withColumnData from "../../HOC/withColumnData";
import { DRAG_MODE_COLUMN, DRAG_MODE_DISABLED } from "../StackOperationView";
import EditableText from "../../ui/EditableText";

export const DRAG_TYPE = "COLUMN_VALUES";

function ColumnView({
  column,
  isSelected,
  isHovered,
  hoverColumn,
  isNull,
  unHoverColumn,
  nullColumn,
  removeColumn,
  renameColumn,
  onCellClick,
  swapColumnsWithinTable,
  dragMode,
  setDragMode,
  limit = 10,
  scrollTop = 0,
  onScroll = () => {},
}) {
  const columnId = column?.id;
  const tableId = column?.tableId;
  const [values, setValues] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const [isColumnNameEditable, setIsColumnNameEditable] = useState(false);

  const dragType = `${DRAG_TYPE}-${column?.tableId}`;
  const isDraggable = dragMode === dragType;

  // Reset state when columnId or tableId changes
  useEffect(() => {
    setValues([]);
    setOffset(0);
    setHasMore(true);
    setError(null);
  }, [columnId, tableId]);

  // Load values when offset changes or initial load
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    getColumnValues(tableId, columnId, limit, offset)
      .then((result) => {
        if (isMounted) {
          setValues((prev) =>
            Array.isArray(result) ? [...prev, ...result] : prev
          );
          setHasMore(Array.isArray(result) && result.length === limit);
        }
      })
      .catch((err) => {
        if (isMounted) setError(err.message);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [columnId, tableId, offset, limit]);

  // Remove handleLoadMore and inline logic in scroll handler to avoid dependency warning

  // Add scroll event listener for lazy loading and sync
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    // Set scroll position when scrollTop changes
    if (container.scrollTop !== scrollTop) {
      container.scrollTop = scrollTop;
    }
    const handleScroll = () => {
      if (
        container.scrollTop + container.clientHeight >=
        container.scrollHeight - 10
      ) {
        if (hasMore && !loading) {
          setOffset((prev) => prev + limit);
        }
      }
      // Notify parent of scroll position
      if (onScroll) {
        onScroll(container.scrollTop);
      }
    };
    container.addEventListener("scroll", handleScroll);
    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [hasMore, loading, limit, scrollTop, onScroll]);

  return (
    <ColumnContainer
      column={column}
      name={column?.name}
      index={column?.index}
      tableId={column?.tableId}
      isDraggable={isDraggable}
      dragType={dragType}
      isSelected={isSelected}
      isHovered={isHovered}
      isNull={isNull}
      handleOnDrop={(draggedColumn) => {
        const droppedColumn = column;
        swapColumnsWithinTable(draggedColumn.id, droppedColumn.id);
        setDragMode(DRAG_MODE_DISABLED);
      }}
      handleOnClick={(event) => onCellClick(event, column?.id)}
      handleOnMouseEnter={hoverColumn}
      handleOnMouseLeave={unHoverColumn}
      handleOnSwapClick={() => setDragMode(dragType)}
      handleOnRemoveClick={removeColumn}
      handleOnNullClick={nullColumn}
      handleOnRenameClick={() => {
        setIsColumnNameEditable(true);
        // Delay focus to allow menu to close first
        setTimeout(() => {
          inputRef.current?.focusAndSelect();
        }, 100); // 50-100ms is usually enough
      }}
      handleOnPopoverClose={() => unHoverColumn()}
    >
      <EditableText
        inputRef={inputRef}
        initialValue={column?.name}
        placeholder={`Column ${column?.index + 1}`}
        onChange={renameColumn}
        isReadOnly={true}
        isEditable={isColumnNameEditable}
        onEditingStateChange={(isEditable) =>
          setIsColumnNameEditable(isEditable)
        }
        fontSize="1rem"
      />
      <Box
        ref={containerRef}
        sx={{
          padding: "0.5rem",
          border: "1px solid #eee",
          borderRadius: "4px",
          marginBottom: "10px",
          maxHeight: "100px",
          overflowY: "auto",
        }}
      >
        {values.map((value, i) => (
          <Typography
            key={i}
            component="div"
            sx={{
              backgroundColor: i % 2 === 0 ? "#fafafa" : "#f0f0f0",
              padding: "0.25rem 0.5rem",
              borderRadius: "2px",
            }}
          >
            {value}
          </Typography>
        ))}
        {error && <Typography color="error">Error: {error}</Typography>}
        {loading && <Typography>Loading values...</Typography>}
      </Box>
    </ColumnContainer>
  );
}

ColumnView.propTypes = {
  column: PropTypes.object.isRequired,
  isSelected: PropTypes.bool,
  isHovered: PropTypes.bool,
  hoverColumn: PropTypes.func,
  isNull: PropTypes.bool,
  unHoverColumn: PropTypes.func,
  nullColumn: PropTypes.func,
  removeColumn: PropTypes.func,
  renameColumn: PropTypes.func,
  onCellClick: PropTypes.func,
  swapColumnsWithinTable: PropTypes.func,
  dragMode: PropTypes.string,
  setDragMode: PropTypes.func,
  limit: PropTypes.number,
  scrollTop: PropTypes.number,
  onScroll: PropTypes.func,
};

const EnhancedColumnView = withColumnData(ColumnView);
export default EnhancedColumnView;
