/**
 * ColumnView/ColumnView.jsx
 * 
 * Notes:
 *  - ColumnView handle the state dispatching state events from 
 *    arbitrary views of Column data take, e.g. remove column,
 *    name column, etc...
 */


import { useDispatch, useSelector } from "react-redux";
import { setHoverColumn } from "../../data/uiSlice";
import { setColumnProperty } from "../../data/tableTreeSlice";
import { COLUMN_LAYOUT_TICK, COLUMN_LAYOUT_CELL } from ".";
import {TickLayout, CellLayout} from "./Layouts";
import { COLUMN_STATUS_NULLED, COLUMN_STATUS_REMOVED } from "../../lib/types/Column";
import "./ColumnView.scss"

export default function ColumnView({column, layout}) {
    const {name, status, index} = column;
    const dispatch = useDispatch();
    const {hoverColumn} = useSelector(({ui}) => ui);

    let state = [];
    if (status === COLUMN_STATUS_NULLED) {
        state.push("null");
    }
    if (hoverColumn === null) {
        state.push("enabled");
    } else if (hoverColumn.index === index) {
        state.push("hover");
    } else {
        state.push("unhover")
    }

    return (
        <div
            className={`ColumnView ${layout} ${state.join(" ")}`}
            onMouseEnter={() => dispatch(setHoverColumn(column))}
            onMouseLeave={() => dispatch(setHoverColumn(null))}
        >
        {(layout === COLUMN_LAYOUT_TICK) ? (
            <TickLayout />
        ) : (layout === COLUMN_LAYOUT_CELL) ? (
            <CellLayout 
                className={`ColumnView cell ${state}`}
                initialValue={name}
                removeColumn={removeColumn}
                nullColumn={nullColumn}
                renameColumn={renameColumn}
            />
        ) : null}
        </div>
    );

    function removeColumn() {
        dispatch(setColumnProperty({
            column,
            property: "status",
            value: COLUMN_STATUS_REMOVED
        }));
    }

    function nullColumn() {
        dispatch(setColumnProperty({
            column,
            property: "status",            
            value: COLUMN_STATUS_NULLED
        }));
    }
    function renameColumn(value) {
        dispatch(setColumnProperty({
            column,
            property: "name",
            value
        }))

    }
}