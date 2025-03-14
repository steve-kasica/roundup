/**
 * TableView.jsx
 * 
 * A component for handling different visual representations of Table data
 */

import { useDispatch, useSelector } from "react-redux";
import { TABLE_LAYOUT_BLOCK, TABLE_LAYOUT_ROW, TABLE_LAYOUT_LIST_ITEM, TABLE_STATE_HOVER } from ".";
// import RowLayout from "../SourceTables/layouts/TableLayout/Row";
import ListItemLayout from "./layouts/ListItemLayout";
import { addTable, removeTable } from "../../data/tableTreeSlice";
import { setHoverTable } from "../../data/uiSlice";
import { isTable } from "../../lib/types/Table";

export default function TableView({table, layout, style, setIsHover}) {
    const dispatch = useDispatch();
    const {hoverTable} = useSelector(({ui}) => ui);
    const selectedTables = useSelector(({ tableTree }) => null);
    const isSelected = false;


    const isHovered = (hoverTable !== null && hoverTable.id === table.id);

    const className = [
        "TableView",
        isHovered ? TABLE_STATE_HOVER : undefined,
        isSelected ? TABLE_STATE_HOVER : undefined
    ].filter(name => name).join(" ");

    const interactionEventHandlers = { 
        addTableEvent,
        removeTableEvent, 
        hoverTableEvent, 
        unhoverTableEvent,
    };
    const state = {isHovered, isSelected};

    return (
        <>
            {
            (layout === TABLE_LAYOUT_BLOCK) ? (
                <p></p>
                // <BlockLayout
                //     className={className}
                //     {...table}
                //     style={style}
                //     setIsHover={setIsHover} // TODO: This is why these views need to be within the component
                //     {...interactionEventHandlers}
                //     {...state}
                // />
            ) : (layout === TABLE_LAYOUT_ROW) ? (
                <p></p>
                // <RowLayout
                //     className={className}
                //     {...table}
                //     style={style}
                //     {...interactionEventHandlers}
                //     {...state}
                // />
            ) : (layout === TABLE_LAYOUT_LIST_ITEM) ? (
                <ListItemLayout 
                    className={className}
                    {...table}
                    style={style}
                    {...interactionEventHandlers}
                    {...state}
                />
            ) : null
            }
        </>
    );

    function addTableEvent(operationType) {
        dispatch(addTable({table, operationType}))
    }
    
    function removeTableEvent() {
        dispatch(removeTable(table));
    }

    function hoverTableEvent() {
        dispatch(setHoverTable(table));
    }

    function unhoverTableEvent() {
        dispatch(setHoverTable(null));
    }
}