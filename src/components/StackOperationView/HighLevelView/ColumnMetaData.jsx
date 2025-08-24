/**
 * ColumnMetaData.jsx
 *
 *
 * Notes:
 *  - *autofocus*: I had technical trouble trigger focus on input elements from the rename option in
 *    the context menu. Follow the useEffect-approach listed on [Stack Overflow](https://stackoverflow.com/a/79315636/3734991)
 *    was able to make the UI perform the desired behavior.
 *
 */

import { useState, useRef } from "react";
import { Popover, List, ListItemButton, Typography } from "@mui/material";
import PropTypes from "prop-types";

import withColumnData from "../../HOC/withColumnData";
import EditableText from "../../ui/EditableText";
import ValuesSample from "./ValuesSample";
import Box from "@mui/material/Box";
import ColumnTypeIcon from "../../ui/ColumnTypeIcon";
import { DRAG_MODE_COLUMN, DRAG_MODE_DISABLED } from "../StackOperationView";
import ColumnContainer from "../ColumnContainer";

// Export drag type constant for use in CustomDragLayer
export const CELL_DRAG_TYPE_PREFIX = "COLUMN-METADATA";

function ColumnMetaData({
  // Props from withColumnData HOC
  column,
  isNull,
  isSelected,
  isHovered,
  hoverColumn,
  unHoverColumn,
  nullColumn,
  removeColumn,
  renameColumn,
  onCellClick,
  swapColumnsWithinTable,
  dragMode,
  setDragMode,
}) {
  const [isColumnNameEditable, setIsColumnNameEditable] = useState(false);
  const dragType = `${CELL_DRAG_TYPE_PREFIX}-${column?.tableId}`;
  const isDraggable = dragMode === dragType;
  // const cellRef = useRef(null);

  // // Combine refs for the main cell (drop target only, drag preview handled by CustomDragLayer)
  // const setCellRef = (element) => {
  //   cellRef.current = element;
  //   dropReference(element);
  // };

  // Input reference is necessary to trigger focus on column
  const inputRef = useRef(null);

  if (isNull) {
    return (
      <ColumnContainer
        column={null}
        name={null}
        index={null}
        tableId={null}
        isDraggable={false}
        dragType={dragType}
        isSelected={false}
        isHovered={false}
        isNull={isNull}
        handleOnDrop={(draggedColumn) => {
          // TODO: what happens if you drop a column on a null column?
          // const droppedColumn = column;
          // swapColumnsWithinTable(draggedColumn.id, droppedColumn.id);
          setDragMode(DRAG_MODE_DISABLED);
        }}
        handleOnClick={(event) => null}
        handleOnMouseEnter={() => null}
        handleOnMouseLeave={() => null}
        handleOnSwapClick={() => null}
        handleOnRemoveClick={() => null}
        handleOnNullClick={() => null}
        handleOnRenameClick={() => null}
        handleOnPopoverClose={() => null}
      >
        <Box
          sx={{
            height: "40px",
            textAlign: "left",
          }}
        >
          <Typography
            variant="h5"
            sx={{
              color: "text.secondary",
              opacity: 0.5,
              padding: "5px",
              fontStyle: "italic",
              cursor: "not-allowed",
            }}
          >
            null
          </Typography>
        </Box>
      </ColumnContainer>
    );
  }
  return (
    <>
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
        handleOnMouseEnter={() => hoverColumn()}
        handleOnMouseLeave={() => unHoverColumn()}
        handleOnSwapClick={() => setDragMode(dragType)}
        handleOnRemoveClick={() => removeColumn()}
        handleOnNullClick={() => nullColumn()}
        handleOnRenameClick={() => {
          setIsColumnNameEditable(true);

          // Delay focus to allow menu to close first
          setTimeout(() => {
            inputRef.current?.focusAndSelect();
          }, 100); // 50-100ms is usually enough
        }}
        handleOnPopoverClose={() => unHoverColumn()}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            height: "40px",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-around",
              alignItems: "flex-start",
              padding: "2.5px 5px",
              flexGrow: 1,
              maxWidth: "100%",
              width: "90%",
              overflow: "hidden",
              cursor: "inherit",
            }}
          >
            <EditableText
              inputRef={inputRef}
              initialValue={column?.name}
              placeholder={`Column ${column?.index + 1}`}
              onChange={renameColumn}
              isReadOnly={true}
              isEditable={isColumnNameEditable}
              onEditingStateChange={setIsColumnNameEditable}
              fontSize="1rem"
            />
            <ValuesSample values={Object.keys(column?.values || {})} />
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "50px",
              borderRadius: "inherit",
              borderTopRightRadius: 0,
              borderBottomRightRadius: 0,
            }}
          >
            <ColumnTypeIcon column={column} />
          </Box>
        </Box>
      </ColumnContainer>
    </>
  );
}

ColumnMetaData.propTypes = {
  column: PropTypes.oneOfType([PropTypes.object, PropTypes.oneOf([null])]),
  isNull: PropTypes.bool,
  isSelected: PropTypes.bool,
  isLoading: PropTypes.bool,
  isHovered: PropTypes.bool,
  isDragging: PropTypes.bool,
  isOver: PropTypes.bool,
  error: PropTypes.any,
  hoverColumn: PropTypes.func.isRequired,
  unHoverColumn: PropTypes.func.isRequired,
  nullColumn: PropTypes.func.isRequired,
  removeColumn: PropTypes.func.isRequired,
  renameColumn: PropTypes.func.isRequired,
  onCellClick: PropTypes.func.isRequired,
  swapColumnsWithinTable: PropTypes.func.isRequired,
};

/**
 * getPercentOverlap
 *
 * Get the percentage of overlap between two element along the x-axis, left to right.
 *
 * @param {DOM} a
 * @param {DOM} b
 *
 * Note that `right` and `left` are relative from the viewport, see [`getBoundingClientRect`](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect)
 */
// eslint-disable-next-line no-unused-vars
function getPercentOverlap(a, b) {
  const { right: aRight, width } = a.getBoundingClientRect();
  const { right: bRight } = b.getBoundingClientRect();
  const overlap = 1 - Math.abs(aRight - bRight) / width;
  return Math.max(0, overlap);
}

const EnhancedColumnMetaData = withColumnData(ColumnMetaData);
export default EnhancedColumnMetaData;
