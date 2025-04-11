/**
 * CompositeTableSchema/ColumnView.jsx
 * 
 * @description: A view for Column instances within the Composite Table Schema component.
 * 
 * Notes:
 *  - A non-breaking space HTML entity (`&nbsp;`) need to be in this div in order for it to have 
 *    width when nesting operations and tables.
 */

import { useDispatch } from "react-redux";
import { COLUMN_STATUS_NULLED } from "../../lib/types/Column";

export default function({column}) {
    const {status, isSelected, isHovered} = column;
    const isNull = (status === COLUMN_STATUS_NULLED);
    const dispatch = useDispatch();

    const state = [
        (isNull) ? "null" : undefined,
        (isHovered) ? "hover" : undefined,
        (isSelected) ? "selected" : undefined
    ].filter(className => className).join(" ");

    return (
        <div 
            className={`ColumnView ${state}`}
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
}