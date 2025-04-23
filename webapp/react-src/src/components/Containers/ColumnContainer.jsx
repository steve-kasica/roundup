import { useSelector } from "react-redux";
import {
  getHoverColumnIndex,
  getHoverTableId,
  getColumnById,
  getHoverColumnId,
  getFocusedColumnIds,
} from "../../data/selectors";

import {
  COLUMN_STATUS_LOADING,
  removeColumnRequest,
} from "../../data/slices/sourceColumnsSlice";
import {
  hoverColumnIndexInTable,
  unhoverColumnIndexInTable,
} from "../../data/uiSlice";

import { Children, cloneElement } from "react";

export function ColumnContainer({ id, index, tableId, children }) {
  const column = useSelector((state) => getColumnById(state, id));
  const hoverColumnIndex = useSelector(getHoverColumnIndex);
  const hoverColumnId = useSelector(getHoverColumnId);
  const focusedColumnIds = useSelector(getFocusedColumnIds);
  const hoverTableId = useSelector(getHoverTableId);

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

  return <div className={className}>{enhancedChildren}</div>;
}
