/**
 * CompositeTableSchema/ColumnView.jsx
 * 
 * 
 */

import { useDispatch, useSelector } from "react-redux";
import { COLUMN_STATUS_NULLED } from "../../lib/types/Column";
import { setHoverColumn } from "../../data/uiSlice";
import { setColumnProperty } from "../../data/tableTreeSlice";

export default function({column}) {
    const {id, status, index, tableId, isSelected} = column;

    const dispatch = useDispatch();
    const {hoverColumnIndex, hoverColumn, hoverTable} = useSelector(({ui}) => ui);

    const state = [
        (status === COLUMN_STATUS_NULLED) ? "null" : undefined,
        (hoverColumnIndex === index || hoverColumn === id || (!hoverColumn && hoverTable === tableId))
            ? "hover" 
            : undefined,
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
            onMouseEnter={() => dispatch(setHoverColumn(id))}
            onMouseLeave={() => dispatch(setHoverColumn(null))}
        >
            &nbsp;
        </div>
    );
}