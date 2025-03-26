/**
 * TableView.jsx
 * 
 * A component for handling different visual representations of Table data
 */

import { useDispatch, useSelector } from "react-redux";
import { TABLE_LAYOUT_BLOCK, TABLE_LAYOUT_ROW, TABLE_LAYOUT_LIST_ITEM, TABLE_STATE_HOVER } from ".";
import ListItemLayout from "./layouts/ListItemLayout";
import { addTable, removeTable, setColumnProperty } from "../../data/tableTreeSlice";

export default function TableView({table, layout, style}) {
    const {columns} = table;
    const dispatch = useDispatch();
    const selectedTables = useSelector(({ tableTree }) => null);
    const isSelected = false;


    // const isHovered = (hoverTable !== null && hoverTable.id === table.id);
    const isHovered = (columns.filter(column => column.isHovered).length === columns.length);

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
        columns.forEach(column => dispatch(setColumnProperty({
            column,
            property: "isHovered",
            value: true
        })));
    }

    function unhoverTableEvent() {
        columns.forEach(column => dispatch(setColumnProperty({
            column,
            property: "isHovered",
            value: false
        })));
    }
}