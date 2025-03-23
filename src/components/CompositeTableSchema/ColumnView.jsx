/**
 * CompositeTableSchema/ColumnView.jsx
 * 
 * A view for Column instances within the Composite Table Schema component
 */

import { useDispatch } from "react-redux";
import { COLUMN_STATUS_NULLED } from "../../lib/types/Column";
import { setColumnHover, setColumnProperty } from "../../data/tableTreeSlice";

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
            onClick={() => dispatch(setColumnProperty({
                column,
                property: "isSelected",
                value: !isSelected
            }))}
            onMouseEnter={() => dispatch(setColumnHover({
                tableId: column.tableId,
                columnId: column.id,
                isHovered: true
            }))}
            onMouseLeave={() => dispatch(setColumnHover({
                tableId: column.tableId,
                columnId: column.id,
                isHovered: false
            }))}
        >
            &nbsp;
        </div>
    );
}