/**
 * Column.jsx
 */

import { useDispatch, useSelector } from "react-redux";
import { setFocusedColumnIndex } from "../../data/uiSlice";


export default function Column({column, style}) {
    const {index} = column;
    const dispatch = useDispatch();
    const displayValue = index + 1;
    const {focusedColumnIndex} = useSelector(({ui}) => ui);
    const isHovered = (focusedColumnIndex === index);

    return (
        <div
            className={`cell ${isHovered ? "hover" : ""}`}
            onMouseEnter={() => dispatch(setFocusedColumnIndex(index))}
            onMouseLeave={() => dispatch(setFocusedColumnIndex(null))}
            style={{
            ...style
        }}>
            <div>
                &nbsp;
            </div>
        </div>
    )
}