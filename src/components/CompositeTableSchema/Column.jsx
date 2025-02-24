/**
 * CompositeTableSchema/Column.jsx
 * 
 * Border color is set to be the same as the containing element's background
 * color to provide the illusion of a margin between column marks when
 * `div.cell` width is very small, e.g. < 3% of parent `div` width
 */

import { useDispatch, useSelector } from "react-redux";
import { setFocusedColumnIndex } from "../../data/uiSlice";

export default function Column({column, colorScale, height, style}) {
    const {index} = column;
    const dispatch = useDispatch();
    const {focusedColumnIndex} = useSelector(({ui}) => ui);
    let state = "";
    if (focusedColumnIndex === null) {
        state = "enabled";
    } else if (focusedColumnIndex === index) {
        state = "hover";
    } else {
        state = "unhover";
    }

    return (
        <div
            className={`cell ${state}`}
            onMouseEnter={() => dispatch(setFocusedColumnIndex(index))}
            onMouseLeave={() => dispatch(setFocusedColumnIndex(null))}
            style={{
                ...style,
            }}>
            <div
                style={{
                    borderColor: colorScale(height + 1),
                    backgroundColor: colorScale(height)
                }}
            >
                &nbsp;
            </div>
        </div>
    )
}