/**
 * CompositeTableSchema/ColumnView.jsx
 * 
 * 
 */

import { useDispatch, useSelector } from "react-redux";
import { COLUMN_STATUS_NULLED } from "../../lib/types/Column";
import { setHoverColumnIndex } from "../../data/uiSlice";

export default function ({column}) {
    const {status, index, tableId} = column;

    const dispatch = useDispatch();
    const {hoverColumnIndex, hoverTable} = useSelector(({ui}) => ui);

    const state = [
        (status === COLUMN_STATUS_NULLED) ? "null" : undefined,
        (hoverColumnIndex === index && (hoverTable === null || hoverTable === tableId))
            ? "hover" 
            : undefined
    ].filter(className => className).join(" ");

    return (
        <div 
            className={`ColumnView ${state}`}
            onMouseEnter={() => dispatch(setHoverColumnIndex(index))}
            onMouseLeave={() => dispatch(setHoverColumnIndex(null))}
        >
            &nbsp;
        </div>
    );
}