/**
 * ColumnView/ColumnView.jsx
 * 
 * Notes:
 *  - ColumnView handle the state dispatching state events from 
 *    arbitrary views of Column data take, e.g. remove column,
 *    name column, etc...
 */


import { useDispatch, useSelector } from "react-redux";
import { setFocusedColumn } from "../../data/uiSlice";
import { setColumnProperty } from "../../data/tableTreeSlice";
import { COLUMN_LAYOUT_TICK, COLUMN_LAYOUT_CELL } from ".";
import {TickLayout, CellLayout} from "./Layouts";
import { COLUMN_STATUS_NULLED, COLUMN_STATUS_REMOVED } from "../../lib/types/Column";
import "./ColumnView.scss"

export default function ColumnView({column, layout, style}) {
    const {index, name, id, status} = column;

    const dispatch = useDispatch();
    const {focusedColumn} = useSelector(({ui}) => ui);

    let state;
    if (status === COLUMN_STATUS_NULLED) {
        state = "null";
    } else if (focusedColumn === null) {
        state = "enabled";
    } else if (focusedColumn.index === index) {
        state = "hovered";
    } else {
        state = "unhovered";
    }

    return (
        <div
            className={`ColumnView ${layout} ${state}`}
            onMouseEnter={focusColumn}
            onMouseLeave={unfocusColumn}
        >
        {(layout === COLUMN_LAYOUT_TICK) ? (
            <TickLayout 
                style={style}
            />
        ) : (layout === COLUMN_LAYOUT_CELL) ? (
            <CellLayout 
                className={`ColumnView cell ${state}`}
                initialValue={state === COLUMN_STATUS_NULLED ? "null" : name}
                removeColumn={removeColumn}
                nullColumn={nullColumn}
                renameColumn={renameColumn}
            />
        ) : null}
        </div>
    );

    function focusColumn() {
        dispatch(setFocusedColumn(column));
    }

    function unfocusColumn() {
        dispatch(setFocusedColumn(null));        
    }

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
    function handlePopoverOnClose() {
        setAnchorEl(null);  // closes popover
    }
}