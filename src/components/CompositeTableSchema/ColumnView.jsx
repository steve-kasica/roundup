/**
 * ColumnView.jsx
 * 
 * 
 */

import { useSelector } from "react-redux";
import { COLUMN_STATUS_NULLED } from "../../lib/types/Column";

export default function ({column}) {
    const {status, index} = column;
    const {hoverColumnIndex} = useSelector(({ui}) => ui);

    const state = [
        (status === COLUMN_STATUS_NULLED) ? "null" : "",
        hoverColumnIndex === index
    ].filter(className => className.length > 0).join(" ");

    return (
        <div className={`ColumnView ${state}`}>
            &nbsp;
        </div>
    );
}