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

const ColumnView = memo(function({tableId, index}) {

    // TODO: this kind of loading and error handling 
    // should happen at the TableView level
    const {isLoading, data, error} = useSelector(({sourceColumns}) => {
        const tableColumns = sourceColumns.data[tableId];
        if (tableColumns) {
            const {loading:isLoading, columns, error} = tableColumns;
            return {
                isLoading,
                data: columns[index] ?? null,
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

    // TODO
    const isSelected = false;
    const isHovered = false;
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
            // onClick={() => dispatch(setColumnProperty({
            //     column,
            //     property: "isSelected",
            //     value: !isSelected
            // }))}
            // onMouseEnter={() => dispatch(setColumnHover({
            //     tableId: column.tableId,
            //     columnId: column.id,
            //     isHovered: true
            // }))}
            // onMouseLeave={() => dispatch(setColumnHover({
            //     tableId: column.tableId,
            //     columnId: column.id,
            //     isHovered: false
            // }))}
        >
            &nbsp;
        </div>
    );
});

export default ColumnView;