import { useSelector } from 'react-redux';
import ColumnBlockView from './ColumnBlockView';
import { 
    getColumnByTableIndex, 
    getHoverColumnIndex, 
    getFocusedColumnId 
} from '../../data/selectors';

import { COLUMN_LAYOUT_BLOCK } from './ColumnBlockView';
import { getColumnId } from '../../data/slices/sourceColumnsSlice';
import {
    hoverColumnIndexInTable,
    unhoverColumnIndexInTable
} from '../../data/uiSlice';

export default function ColumnContainer({ tableId, index, layout }) {
    const column = useSelector(state => getColumnByTableIndex(state, tableId, index));
    const hoveredColumnIndex = useSelector(getHoverColumnIndex);
    const focusedColumnId = useSelector(getFocusedColumnId);

    const isNull = !column;
    const isSelected = false; // TODO: implement selection logic
    const isHovered = hoveredColumnIndex === index;
    const isFocused = column && column.id === focusedColumnId;
    const isLoading = false; // TODO: implement loading logic

    // Determine props based on null status
    const id = isNull ? getColumnId(tableId, index) : column.id;
    const name = isNull ? "null" : column.name;
    const columnType = isNull ? "null" : column.columnType;

    let ColumnView;
    switch (layout) {
        case COLUMN_LAYOUT_BLOCK:
            ColumnView = ColumnBlockView;
            break;
        default:
            throw new Error(`Unsupported layout: ${layout}`);
    }

    const className = [
        "ColumnView",
        (isLoading)     ? "loading"     : undefined,
        (isNull)        ? "null"        : undefined,
        (isHovered)     ? "hover"       : undefined,
        (isSelected)    ? "selected"    : undefined,
        (isFocused)     ? "focused"     : undefined,
    ].filter(cn => cn).join(" ");

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
            />
        </div>
    );

    function handleColumnFocus() {
            // TODO: setup selected/focused UIs
            // onClick={() => dispatch(setColumnProperty({
            //     column,
            //     property: "isSelected",
            //     value: !isSelected
            // }))}
    }

    function handleColumnHover() {
        dispatch(hoverColumnIndexInTable({ 
            tableId, 
            columnIndex: index 
        }));
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
 

/**
 *     const dispatch = useDispatch();
    // TODO: this kind of loading and error handling 
    // should happen at the TableView level
    // const {isLoading, data, error} = useSelector(({sourceColumns}) => {
    //     const tableColumns = sourceColumns.data[tableId];
    //     if (tableColumns) {
    //         const {loading:isLoading, columns, error} = tableColumns;
    //         return {
    //             isLoading,
    //             data: columns[columnIndex] ?? null,
    //             error
    //         };            
    //     } else {
    //         return {
    //             isLoading: true,
    //             data: null,
    //             error: null
    //         }
    //     }
    // }, shallowEqual);
 */