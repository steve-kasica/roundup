/**
 * CompositeTableSchema/ColumnView.jsx
 * 
 * @description: A view for Column instances within the Composite Table Schema component.
 * 
 * Notes:
 *  - A non-breaking space HTML entity (`&nbsp;`) need to be in this div in order for it to have 
 *    width when nesting operations and tables.
 */

import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { memo } from "react";
import { hoverColumnIndexInTable, unhoverColumnIndexInTable } from "../../data/uiSlice";
import { isColumnHover } from "../../data/selectors.js";

const ColumnView = memo(function({tableId, columnIndex}) {
    const dispatch = useDispatch();
    // TODO: this kind of loading and error handling 
    // should happen at the TableView level
    const {isLoading, data, error} = useSelector(({sourceColumns}) => {
        const tableColumns = sourceColumns.data[tableId];
        if (tableColumns) {
            const {loading:isLoading, columns, error} = tableColumns;
            return {
                isLoading,
                data: columns[columnIndex] ?? null,
                error
            };            
        } else {
            return {
                isLoading: true,
                data: null,
                error: null
            }
        }
    }, shallowEqual);

    const isSelected = false;
    const isHovered = useSelector(state => isColumnHover(state, { tableId, index: columnIndex }));
    const isNull = (data === null);

    const state = [
        "ColumnView",
        (isLoading) ? "loading" : undefined,
        (isNull) ? "null" : undefined,
        (isHovered) ? "hover" : undefined,
        (isSelected) ? "selected" : undefined
    ].filter(className => className);

    return (
        <div 
            className={state.join(" ")}
            // TODO: setup selected/focused UIs
            // onClick={() => dispatch(setColumnProperty({
            //     column,
            //     property: "isSelected",
            //     value: !isSelected
            // }))}
            onMouseEnter={() => 
                dispatch(hoverColumnIndexInTable({ tableId, columnIndex }))
            }
            onMouseLeave={() => dispatch(unhoverColumnIndexInTable())}
        >
            &nbsp;
        </div>
    );
});

export default ColumnView;