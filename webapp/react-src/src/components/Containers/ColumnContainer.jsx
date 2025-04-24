import { useSelector } from "react-redux";
import { getColumnById } from "../../data/selectors";
import {
  selectSelectedColumnIds,
  selectHoveredColumnId,
  selectHoveredColumnIndex,
  selectHoveredTableId,
} from "../../data/slices/uiSlice";

import { Children, cloneElement } from "react";

export function ColumnContainer({ id, index, tableId, onClick, children }) {
  const column = useSelector((state) => getColumnById(state, id));
  const hoverColumnIndex = useSelector(selectHoveredColumnIndex);
  const hoverColumnId = useSelector(selectHoveredColumnId);
  const focusedColumnIds = useSelector(selectSelectedColumnIds);
  const hoverTableId = useSelector(selectHoveredTableId);

  const isNull = !column;
  const isSelected = false; // TODO: implement selection logic
  const isHovered =
    hoverColumnId === id ||
    (!hoverColumnId && !hoverTableId && hoverColumnIndex === index) ||
    (!hoverColumnId && !hoverColumnIndex && hoverTableId === tableId);
  const isFocused = column && focusedColumnIds.includes(id);
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
    .filter(Boolean)
    .join(" ");

  const enhancedChildren = Children.map(children, (child) =>
    cloneElement(child, {
      column,
    })
  );

  return (
    <div className={className} onClick={() => onClick(column)}>
      {enhancedChildren}
    </div>
  );
}
