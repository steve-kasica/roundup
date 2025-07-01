import { useDispatch, useSelector } from "react-redux";
import PropTypes from "prop-types";
import {
  setHoveredColumns,
  setSelectedColumns,
  selectSelectedColumns,
  selectColumnById,
  removeFromHoveredColumns,
  removeColumnsFromDragging,
} from "../../data/slices/columnsSlice";

import { setDrawerContents } from "../../data/slices/uiSlice";
import { COMPONENT_ID as COLUMN_INDEX_VALUES_COMPONENT } from "../ColumnValueMatrix";
import { swapColumnsAction } from "../../data/sagas/swapColumnsSaga";
import { getValuesAction } from "../../data/sagas/getValuesSaga";

/**
 * This HOC takes an array of columnIds are passes on some relevalent metadata about this
 * particular group of columns without passing along metadata about individual columns.
 * I call this a column vector, as opposed to a column group, because the order of the
 * column ids matters.
 * @param {React.ComponentType} WrappedComponent
 * @returns {React.FC<{ index: number, tableIds: string[] }>}
 */
export default function withColumnVectorData(WrappedComponent) {
  function EnhancedComponent({ columnIds, ...props }) {
    const dispatch = useDispatch();

    const columns = useSelector((state) =>
      columnIds.map((columnId) => selectColumnById(state, columnId))
    );
    const selectedColumnIds = useSelector(selectSelectedColumns);

    const columnNames = columns.map((col) => col?.name || "");

    const hasSelected =
      new Set(columnIds).intersection(new Set(selectedColumnIds)).size > 0;
    const maxColumnNameLength = Math.max(
      ...columnNames.map((name) => name.length),
      0
    );

    return (
      <WrappedComponent
        {...props}
        columnIds={columnIds}
        // Derive properties from columnIds
        maxColumnNameLength={maxColumnNameLength}
        hasSelected={hasSelected}
        // Dispatchable actions
        hoverColumnVector={() => dispatch(setHoveredColumns(columnIds))}
        unhoverColumnVector={() =>
          dispatch(removeFromHoveredColumns(columnIds))
        }
        selectColumnVector={() => dispatch(setSelectedColumns(columnIds))}
        compareVectorValues={() =>
          dispatch(setDrawerContents(COLUMN_INDEX_VALUES_COMPONENT))
        }
        fetchColumnValues={() => dispatch(getValuesAction(columnIds))}
        undragColumnVector={() =>
          dispatch(removeColumnsFromDragging(columnIds))
        }
        swapColumnVectors={(targetColumnIds) =>
          dispatch(
            swapColumnsAction({ source: columnIds, target: targetColumnIds })
          )
        }
      />
    );
  }
  EnhancedComponent.propTypes = {
    index: PropTypes.number.isRequired,
    columnIds: PropTypes.arrayOf(PropTypes.string),
  };
  return EnhancedComponent;
}
