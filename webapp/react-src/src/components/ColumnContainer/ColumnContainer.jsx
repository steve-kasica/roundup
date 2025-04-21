import { useSelector } from "react-redux";
import ColumnBlockView from "./ColumnBlockView";
import ColumnTickView from "./ColumnTickView";
import {
  getColumnByTableIndex,
  getHoverColumnIndex,
  getFocusedColumnId,
} from "../../data/selectors";

import {
  COLUMN_STATUS_LOADING,
  getColumnId,
} from "../../data/slices/sourceColumnsSlice";
import {
  hoverColumnIndexInTable,
  unhoverColumnIndexInTable,
} from "../../data/uiSlice";

import { COLUMN_LAYOUT_BLOCK, COLUMN_LAYOUT_TICK } from ".";

export default function ColumnContainer({ tableId, index, layout }) {
  const column = useSelector((state) =>
    getColumnByTableIndex(state, tableId, index)
  );

  if (column === undefined) {
    throw new Error("Column is undefined");
  }

  const hoveredColumnIndex = useSelector(getHoverColumnIndex);
  const focusedColumnId = useSelector(getFocusedColumnId);

  const isNull = !column;
  const isSelected = false; // TODO: implement selection logic
  const isHovered = hoveredColumnIndex === index; // TODO: implement more complex logic
  const isFocused = column && column.id === focusedColumnId;
  const isLoading = column.status === COLUMN_STATUS_LOADING;

  // Determine props based on null status
  const id = isNull ? getColumnId(tableId, index) : column.id;
  const name = isNull ? "null" : column.name;
  const columnType = isNull ? "null" : column.columnType;

  let ColumnView;
  switch (layout) {
    case COLUMN_LAYOUT_BLOCK:
      ColumnView = ColumnBlockView;
      break;
    case COLUMN_LAYOUT_TICK:
      ColumnView = ColumnTickView;
      break;
    default:
      throw new Error(`Unsupported layout: ${layout}`);
  }

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

  return (
    <div
      className={className}
      onClick={handleColumnFocus}
      onMouseEnter={handleColumnHover}
      onMouseLeave={handleColumnUnhover}
    >
      <ColumnView
        id={id}
        tableId={tableId}
        name={name}
        index={index}
        columnType={columnType}
        isLoading={isLoading}
        isSelected={isSelected}
        isNull={isNull}
        isHovered={isHovered}
        isFocused={isFocused}
        handleRemoveColumn={handleRemoveColumn}
        handleColumnHover={handleColumnHover}
        handleColumnUnhover={handleColumnUnhover}
        handleColumnFocus={handleColumnFocus}
        handleColumnUnfocus={handleColumnUnfocus}
        handleRemoveColumnsAfter={handleRemoveColumnsAfter}
        handleRenameColumn={handleRenameColumn}
      />
    </div>
  );

  function handleRenameColumn() {
    console.log("rename column");
  }

  function handleRemoveColumn() {
    dispatch(
      removeColumn({
        tableId,
        columnIndex: index,
        columnName: name,
      })
    );
  }

  function handleRemoveColumnsAfter() {
    // TODO: implement remove columns after
  }

  function handleColumnUnfocus() {
    dispatch(unfocusColumnId());
  }

  function handleColumnFocus() {
    // TODO: setup selected/focused UIs
    // onClick={() => dispatch(setColumnProperty({
    //     column,
    //     property: "isSelected",
    //     value: !isSelected
    // }))}
  }

  function handleColumnHover() {
    dispatch(
      hoverColumnIndexInTable({
        tableId,
        columnIndex: index,
      })
    );
  }
  function handleColumnUnhover() {
    dispatch(unhoverColumnIndexInTable());
  }
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
