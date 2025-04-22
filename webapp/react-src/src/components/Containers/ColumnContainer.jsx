import { useDispatch, useSelector } from "react-redux";
import {
  getHoverColumnIndex,
  getFocusedColumnId,
  getHoverTableId,
  getColumnById,
} from "../../data/selectors";

import {
  COLUMN_STATUS_LOADING,
  removeColumnRequest,
} from "../../data/slices/sourceColumnsSlice";
import {
  focusColumn,
  hoverColumnIndexInTable,
  unhoverColumnIndexInTable,
} from "../../data/uiSlice";

import { Children, cloneElement } from "react";

export function ColumnContainer({ id, index, tableId, children }) {
  const dispatch = useDispatch();

  const column = useSelector((state) => getColumnById(state, id));
  const hoverColumnIndex = useSelector(getHoverColumnIndex);
  const focusedColumnId = useSelector(getFocusedColumnId);
  const hoverTableId = useSelector(getHoverTableId);

  const isNull = !column;
  const isSelected = false; // TODO: implement selection logic
  const isHovered =
    (hoverColumnIndex === index && hoverTableId === null) ||
    (hoverColumnIndex === null && hoverTableId === tableId);
  const isFocused = column && id === focusedColumnId;
  // const isLoading = !isNull && status === COLUMN_STATUS_LOADING;
  const isLoading = false;

  const className = [
    "ColumnView",
    isLoading ? "loading" : undefined,
    isNull ? "null" : undefined,
    isHovered ? "hover" : undefined,
    isSelected ? "selected" : undefined,
    isFocused ? "focused" : undefined,
  ]
    .filter((cn) => cn)
    .join(" ");

  const enhancedChildren = Children.map(children, (child) =>
    cloneElement(child, {
      column,
    })
  );

  return (
    <div
      className={className}
      // onClick={() => dispatch(focusColumn())}
      onMouseEnter={() =>
        dispatch(
          hoverColumnIndexInTable({
            tableId,
            columnIndex: index,
          })
        )
      }
      onMouseLeave={() => dispatch(unhoverColumnIndexInTable())}
    >
      {enhancedChildren}
    </div>
  );

  // function handleRenameColumn() {
  //   console.log("rename column");
  // }

  // function handleRemoveColumn() {
  //   if (isNull) {
  //     throw new Error("Cannot remove null column");
  //   }
  //   dispatch(removeColumnRequest({ tableId, index, name }));
  // }

  // function handleRemoveColumnsAfter() {
  //   // TODO: implement remove columns after
  // }

  // function handleColumnUnfocus() {
  //   // dispatch(unfocusColumnId());
  // }

  // function handleColumnFocus() {
  //   // TODO: setup selected/focused UIs
  //   // onClick={() => dispatch(setColumnProperty({
  //   //     column,
  //   //     property: "isSelected",
  //   //     value: !isSelected
  //   // }))}
  // }

  // function handleColumnHover() {
  //   dispatch(
  //     hoverColumnIndexInTable({
  //       tableId,
  //       columnIndex: index,
  //     })
  //   );
  // }
  // function handleColumnUnhover() {
  //   dispatch(unhoverColumnIndexInTable());
  // }
}

/* 
export const isColumnHover = (state, column) => {
    const hoverTable = getHoverTable(state);
    const isTableMatch = isTableHover(state, column.tableId);
    const hoverColumnIndex = getHoverColumnIndex(state);
    return (
        (isTableMatch && (hoverColumnIndex === column.index || hoverColumnIndex === initialState.ui.hover.columnIndex)) ||
        (hoverColumnIndex === column.index && hoverTable === initialState.ui.hover.table)
    );    
}
*/
