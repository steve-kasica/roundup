/**
 * CompositeTableSchema/ColumnView.jsx
 * 
 * Notes:
 */

import { useDispatch } from "react-redux";
import { COLUMN_STATUS_NULLED } from "../../lib/types/Column";
import { setColumnProperty } from "../../data/tableTreeSlice";

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
            onMouseEnter={() => dispatch(setColumnProperty({
                column,
                property: "isHovered",
                value: true
            }))}
            onMouseLeave={() => dispatch(setColumnProperty({
                column,
                property: "isHovered",
                value: false
            }))}
        >
        </div>
    );
}