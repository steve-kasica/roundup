import { useDispatch, useSelector } from "react-redux";
import PropTypes from "prop-types";
import { useEffect } from "react";
import {
  removeColumnsFromDragging,
  setHoveredColumns,
  removeFromHoveredColumns,
  setSelectedColumns,
  clearHoveredColumns,
  selectSelectedColumns,
  selectColumnById,
} from "../../data/slices/columnsSlice";

import { useDrag, useDrop } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";
import { setDrawerContents } from "../../data/slices/uiSlice";
import { COMPONENT_ID as COLUMN_INDEX_VALUES_COMPONENT } from "../ColumnValueMatrix";
import { swapColumnsAction } from "../../data/sagas/swapColumnsSaga";
import { selectTablesById } from "../../data/slices/tablesSlice/tableSelectors";
import { getValuesAction } from "../../data/sagas/getValuesSaga";

export const COLUMN_INDEX = "COLUMN_INDEX";

/**
 * HOC to provide all column data objects at a given index across multiple tables.
 * @param {React.ComponentType} WrappedComponent
 * @returns {React.FC<{ index: number, tableIds: string[] }>}
 */
export default function withColumnVectorData(WrappedComponent) {
  function EnhancedComponent({ index, tableIds, ...props }) {
    const dispatch = useDispatch();

    const tables = useSelector((state) =>
      tableIds.map((tableId) => selectTablesById(state, tableId))
    );
    const columnIds = tables.map((table) => table.columnIds.at(index));
    const columns = useSelector((state) =>
      columnIds.map((columnId) => selectColumnById(state, columnId))
    );
    const selectedColumnIds = useSelector(selectSelectedColumns);

    const [{ isDragging }, dragRef, previewRef] = useDrag({
      type: COLUMN_INDEX,
      item: () => {
        return { columnIds, index };
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      end: () => {
        // Dispatch certain actions when the drag operation ends,
        // regardless of whether or it reached a drop target
        dispatch(removeColumnsFromDragging(columnIds));
        dispatch(removeFromHoveredColumns(columnIds));
      },
    });

    // This useEffect is to make the isDragging state available globally
    // TODO: causing an infinite loop
    // useEffect(() => {
    //   console.log("Column vector drag state changed:", isDragging, columnIds);
    //   if (isDragging) {
    //     // dispatch(addColumnsToDragging(columnIds));
    //   } else {
    //     // dispatch(removeFromHoveredColumns(columnIds));
    //   }
    // }, [isDragging, columnIds, dispatch]);

    const [{ isHovered }, dropRef] = useDrop({
      accept: COLUMN_INDEX,
      drop: (droppedItem) => {
        // Remember, in this context `droppedItem.columnIds` === `columnIds` in useDrag
        if (droppedItem.index !== index) {
          dispatch(
            swapColumnsAction({
              sourceIds: droppedItem.columnIds,
              targetIds: columnIds,
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
        columnNames={columns.map((col) => col?.name || "")} // TODO: just pass the max name length
        hasSelected={
          new Set(columnIds).intersection(new Set(selectedColumnIds)).size > 0
        }
        dragRef={dragRef}
        dropRef={dropRef}
        isDragging={isDragging}
        isHovered={isHovered}
        hoverColumnVector={() => dispatch(setHoveredColumns(columnIds))}
        unhoverColumnVector={() => dispatch(clearHoveredColumns())}
        selectColumnVector={() => dispatch(setSelectedColumns(columnIds))}
        compareVectorValues={() =>
          dispatch(setDrawerContents(COLUMN_INDEX_VALUES_COMPONENT))
        }
        fetchColumnValues={() => dispatch(getValuesAction(columnIds))}
      />
    );
  }
  EnhancedComponent.propTypes = {
    index: PropTypes.number.isRequired,
    tableIds: PropTypes.arrayOf(PropTypes.string),
  };
  return EnhancedComponent;
}
