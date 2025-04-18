import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { getHoverTableId, getTableById } from '../../data/selectors';
import { hoverTable, unhoverTable } from '../../data/uiSlice';
import TableBlockView from './TableBlockView';
import TableRowView from './TableRowView';
import { DragPreviewImage, useDrag } from "react-dnd";
import { dataType as SourceTable } from "../../data/slices/sourceTablesSlice";
import tableIconImage from "../../../public/images/table-icon.png";
import { DROP_TARGET_EVENT_INITIALIZE } from '../CompositeTableSchema/TableDropTarget';
import { CHILD_TYPE_TABLE, createOperation, OPERATION_TYPE_NO_OP } from '../../data/slices/operationsSlice';
import TableListItemView from './TableListItemView';
import {formatDate, formatNumber} from "../../lib/utilities/formaters";

export const TABLE_LAYOUT_BLOCK = 'block';
export const TABLE_LAYOUT_ROW = 'row';
export const TABLE_LAYOUT_LIST_ITEM = 'list-item';

export default function TableContainer({ id, layout, isDraggable }) {
  const dispatch = useDispatch();
  const table = useSelector(state => getTableById(state, id));
  const hoverTableId = useSelector(getHoverTableId);

  let TableView, containerElementType;
  switch(layout) { 
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

  const isHover = table.id === hoverTableId;

  // TODO: does this cause a re-render?
  const selectedTables = useSelector(state => {
    if (Object.keys(state.operations.entities).length === 0) {
      return [];
    }
    return Object.values(state.operations.entities).map(operation => {
      return operation.children
        .filter(child => (child.type === CHILD_TYPE_TABLE))
        .map(child => child.id);
    }).flat()
  });
  const isSelected = selectedTables.includes(table.id);

  return (
    <ContainerComponent
      as={containerElementType}
      tableId={table.id}
      isHover={isHover}
      isSelected={isSelected}
      isDraggable={isDraggable}
      handleSelectedTable={handleSelectedTable}
    >
      <TableView
        parentId={id}    
        id={table.id} 
        name={table.name} 
        rowCount={table.rowCount}
        columnCount={table.columnCount}
        dateCreated={table.dateCreated}
        dateLastModified={table.dateLastModified}
        tags={table.tags}
        handleRemoveTable={handleRemoveTable}
        handleSelectTable={handleSelectedTable}        
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

  function handleSelectedTable(dropTargetEventType) {
    if (dropTargetEventType === DROP_TARGET_EVENT_INITIALIZE) {
      return dispatch(createOperation({
        operationType: OPERATION_TYPE_NO_OP,
        children: [table.id],
        parentId: null
      }));
    }
  }
}

function ContainerComponent({
  as: Component="div", 
  tableId,
  children,
  isDisabled,
  isHover,
  isSelected,
  isDraggable,
  handleSelectedTable,
}) {
  const dispatch = useDispatch();
  let dragState = {isDragging:false}, dragRef, previewRef;
  const [isPressed, setIsPressed] = useState(false);

  if (isDraggable) {
    [dragState, dragRef, previewRef] = useDrag(() => ({
      type: SourceTable,
      item: {tableId},
      end: (item, monitor) => {
        const result = monitor.getDropResult();
        if (monitor.didDrop() && tableId === result.tableId) {
          // Table has dropped
          handleSelectedTable(result.dropTargetEvent);
        }
        setIsPressed(false);
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }), [tableId]);
  }

  const className = [
    "TableView",
    isHover               ? "hover"       : undefined,
    isSelected            ? "selected"    : undefined,
    isDisabled            ? "disabled"    : undefined,
    dragState.isDragging  ? "dragging"    : undefined,
    isPressed             ? "pressed"     : undefined,
  ].filter(Boolean).join(" ");

  return (
    <>
      {
        (isDraggable) ? (
          <DragPreviewImage connect={previewRef} src={tableIconImage} />
        ) : null
      }
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