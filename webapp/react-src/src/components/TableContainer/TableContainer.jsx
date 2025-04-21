import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  getHoverTableId,
  getTableById,
  getHoverOperationTableIds,
  getColumnsByTableId,
} from "../../data/selectors";
import { hoverTable, unhoverTable } from "../../data/uiSlice";
import { DragPreviewImage, useDrag } from "react-dnd";
import { dataType as SourceTable } from "../../data/slices/sourceTablesSlice";
import tableIconImage from "../../../public/images/table-icon.png";
import {
  DROP_TARGET_EVENT_INITIALIZE,
  DROP_TARGET_EVENT_PACK,
  DROP_TARGET_EVENT_STACK,
} from "../CompositeTableSchema/TableDropTarget";
import {
  addNewChildren,
  CHILD_TYPE_TABLE,
  createOperation,
  OPERATION_TYPE_NO_OP,
  OPERATION_TYPE_PACK,
  OPERATION_TYPE_STACK,
} from "../../data/slices/operationsSlice";

import TableListItemView from "./TableListItemView";
import TableBlockView from "./TableBlockView";
import TableRowView from "./TableRowView";
import { fetchSourceTableColumnsRequest } from "../../data/slices/sourceColumnsSlice";
import { sourceTableSelected } from "../../data/actions";

export const TABLE_LAYOUT_BLOCK = "block";
export const TABLE_LAYOUT_ROW = "row";
export const TABLE_LAYOUT_LIST_ITEM = "list-item";

export default function TableContainer({
  id,
  layout,
  isDraggable,
  operationColumnCount,
}) {
  const dispatch = useDispatch();
  const table = useSelector((state) => getTableById(state, id));
  // const columns = useSelector((state) => getColumnsByTableId(state, id));
  const hoverTableId = useSelector(getHoverTableId);
  const hoverOperationTableIds = useSelector(getHoverOperationTableIds);

  // useEffect(() => {
  //     dispatch(fetchTablesRequest());
  // }, [dispatch]);

  let TableView, containerElementType;
  switch (layout) {
    case TABLE_LAYOUT_BLOCK:
      TableView = TableBlockView;
      containerElementType = "div";
      break;
    case TABLE_LAYOUT_ROW:
      TableView = TableRowView;
      containerElementType = "tr";
      break;
    case TABLE_LAYOUT_LIST_ITEM:
      TableView = TableListItemView;
      containerElementType = "div";
      break;
    default:
      throw new Error(`Unknown layout type: ${layout}`);
  }

  const isHover =
    table.id === hoverTableId ||
    (hoverTableId === null && hoverOperationTableIds.includes(table.id));

  // TODO: does this cause a re-render?
  const selectedTables = useSelector((state) => {
    if (Object.keys(state.operations.entities).length === 0) {
      return [];
    }
    return Object.values(state.operations.entities)
      .map((operation) => {
        return operation.children
          .filter((child) => child.type === CHILD_TYPE_TABLE)
          .map((child) => child.id);
      })
      .flat();
  });
  const isSelected = selectedTables.includes(table.id);

  return (
    <ContainerComponent
      as={containerElementType}
      tableId={table.id}
      isHover={isHover}
      isSelected={isSelected}
      isDraggable={isDraggable}
      handleTableSelected={handleTableSelected}
    >
      <TableView
        parentId={id}
        id={table.id}
        name={table.name}
        rowCount={table.rowCount}
        columnCount={table.columnCount}
        operationColumnCount={operationColumnCount}
        dateCreated={table.dateCreated}
        dateLastModified={table.dateLastModified}
        tags={table.tags}
        handleRemoveTable={handleRemoveTable}
        handleRemoveOperation={handleRemoveOperation}
        handleSelectOperation={handleSelectedOperation}
        isSelected={isSelected}
      />
    </ContainerComponent>
  );

  function handleRemoveTable() {
    return dispatch(removeTable(table.id));
  }

  function handleRemoveOperation() {
    return dispatch(removeOperation(table.parentId));
  }

  function handleSelectedOperation() {
    // ?
  }

  function handleTableSelected(operationType) {
    dispatch(
      sourceTableSelected({
        operationType,
        table,
      })
    );
  }
}

function ContainerComponent({
  as: Component = "div",
  tableId,
  children,
  isDisabled,
  isHover,
  isSelected,
  isDraggable,
  handleTableSelected,
}) {
  const dispatch = useDispatch();
  let dragState = { isDragging: false },
    dragRef,
    previewRef;
  const [isPressed, setIsPressed] = useState(false);

  if (isDraggable) {
    [dragState, dragRef, previewRef] = useDrag(
      () => ({
        type: SourceTable,
        item: { tableId },
        end: (item, monitor) => {
          const result = monitor.getDropResult();
          if (monitor.didDrop() && tableId === result.tableId) {
            // Table has dropped
            if (result.dropTargetEvent === DROP_TARGET_EVENT_INITIALIZE) {
              handleTableSelected(OPERATION_TYPE_NO_OP);
            } else if (result.dropTargetEvent === DROP_TARGET_EVENT_STACK) {
              handleTableSelected(OPERATION_TYPE_STACK);
            } else if (result.dropTargetEvent === DROP_TARGET_EVENT_PACK) {
              handleTableSelected(OPERATION_TYPE_PACK);
            } else {
              throw new Error("unknown drop target");
            }
          }
          setIsPressed(false);
        },
        collect: (monitor) => ({
          isDragging: monitor.isDragging(),
        }),
      }),
      [tableId]
    );
  }

  const className = [
    "TableView",
    isHover ? "hover" : undefined,
    isSelected ? "selected" : undefined,
    isDisabled ? "disabled" : undefined,
    dragState.isDragging ? "dragging" : undefined,
    isPressed ? "pressed" : undefined,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      {isDraggable ? (
        <DragPreviewImage connect={previewRef} src={tableIconImage} />
      ) : null}
      <Component
        ref={dragRef}
        className={className}
        data-id={tableId}
        onMouseEnter={handleOnMouseEnter}
        onMouseLeave={handleOnMouseLeave}
      >
        {children}
      </Component>
    </>
  );

  function handleOnMouseEnter() {
    return dispatch(hoverTable(tableId));
  }

  function handleOnMouseLeave() {
    return dispatch(unhoverTable());
  }
}
