/**
 * CompositeTableSchema/ColumnView.jsx
 * 
 * Notes:
 *  - *Null columns*: Sometimes a null column instance is passed to this view via the 
 *    `column` prop. Since this column does not exist in the dataset,
 *    I've disabled pointer events on elements that match `div.ColumnView.null`
 *    so the onClick event defined here does not fire for those cases.
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