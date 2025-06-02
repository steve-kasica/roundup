import { useDispatch, useSelector } from "react-redux";
import PropTypes from "prop-types";
import { selectColumnsByIndex } from "../../data/slices/columnsSlice/columnSelectors";
import { useEffect, useMemo } from "react";
import { setColumnDragStatus } from "../../data/slices/columnsSlice";
import {
  setHoveredColumns,
  removeFromHoveredColumns,
  clearHoveredColumns,
} from "../../data/slices/uiSlice";
import { useDrag, useDrop } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";
import { swapColumnIndices } from "../../data/sagas/swapColumnIndicesSaga";
import {
  setDrawerContents,
  setSelectedColumns,
} from "../../data/slices/uiSlice";
import { COMPONENT_ID as COLUMN_INDEX_VALUES_COMPONENT } from "../ColumnValueMatrix";

export const COLUMN_INDEX = "COLUMN_INDEX";

/**
 * HOC to provide all column data objects at a given index across multiple tables.
 * @param {React.ComponentType} WrappedComponent
 * @returns {React.FC<{ index: number, tableIds: string[] }>}
 */
export default function withColumnVectorData(WrappedComponent) {
  function EnhancedComponent({ index, tableIds, ...props }) {
    const dispatch = useDispatch();

    // Default: get all tableIds from state if not provided
    // Get column IDs at the given index for each table
    const columns = useSelector((state) =>
      selectColumnsByIndex(state, index, tableIds)
    );

    const columnIds = useMemo(() => {
      return columns.map((col) => col?.id).filter(Boolean); // columns may be null
    }, [columns]);

    const [{ isDragging }, dragRef, previewRef] = useDrag({
      type: COLUMN_INDEX,
      item: () => {
        return { columnIds, index };
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      end: () => {
        // This is called when the drag operation ends
        columnIds.forEach((id) => {
          dispatch(setColumnDragStatus({ id, isDragging: false }));
          dispatch(removeFromHoveredColumns(id));
        });
      },
    });

    useEffect(() => {
      columnIds.forEach((id) => {
        dispatch(setColumnDragStatus({ id, isDragging }));
      });
    }, [isDragging, columnIds, dispatch]);

    const [{ isHovered }, dropRef] = useDrop({
      accept: COLUMN_INDEX,
      drop: (droppedItem) => {
        // Remember, in this context `droppedItem.columnIds` === `columnIds` in useDrag
        if (droppedItem.index !== index) {
          dispatch(
            swapColumnIndices({
              sourceColumnIds: droppedItem.columnIds,
              targetColumnIds: columnIds,
            })
          );
        }
      },
      collect: (monitor) => ({
        isHovered: monitor.isOver(),
      }),
    });

    // Disable the default drag preview
    useEffect(() => {
      previewRef(getEmptyImage(), { captureDraggingState: true });
    }, []);

    return (
      <WrappedComponent
        {...props}
        index={index}
        columnIds={columnIds}
        columnNames={columns.map((col) => col?.name || "")}
        hasSelected={columns.some((col) => col?.status.isSelected)}
        dragRef={dragRef}
        dropRef={dropRef}
        isDragging={isDragging}
        isHovered={isHovered}
        hoverColumnVector={() => dispatch(setHoveredColumns(columnIds))}
        unhoverColumnVector={() => dispatch(clearHoveredColumns())}
        selectColumnVector={() => {
          dispatch(setSelectedColumns(columnIds));
        }}
        compareVectorValues={() =>
          dispatch(setDrawerContents(COLUMN_INDEX_VALUES_COMPONENT))
        }
      />
    );
  }
  EnhancedComponent.propTypes = {
    index: PropTypes.number.isRequired,
    tableIds: PropTypes.arrayOf(PropTypes.string),
  };
  return EnhancedComponent;
}
