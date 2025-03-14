/**
 * CompositeTableSchema/ColumnView.jsx
 * 
 * 
 */

import { useDispatch, useSelector } from "react-redux";
import { COLUMN_STATUS_NULLED } from "../../lib/types/Column";
import { setHoverColumn } from "../../data/uiSlice";

export default function({column}) {
    const {id, status, index, tableId} = column;

    const dispatch = useDispatch();
    const {hoverColumnIndex, hoverColumn, hoverTable} = useSelector(({ui}) => ui);

    const state = [
        (status === COLUMN_STATUS_NULLED) ? "null" : undefined,
        (hoverColumnIndex === index || hoverColumn === id || (!hoverColumn && hoverTable === tableId))
            ? "hover" 
            : undefined,
    ].filter(className => className).join(" ");

    return (
        <div 
            className={`ColumnView ${state}`}
            onMouseEnter={() => dispatch(setHoverColumn(id))}
            onMouseLeave={() => dispatch(setHoverColumn(null))}
        >
            &nbsp;
        </div>
    );
}