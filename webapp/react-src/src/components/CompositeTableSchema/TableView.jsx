/**
 * CompositeTableSchema/TableView.jsx
 * -----------------------------------------------------------------
 * A visual representation of **source table** data in the 
 * **Table Tree**.
 */
import { Menu, MenuItem } from "@mui/material";
import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setHover, setSelectedOperation, STAGE_REFINE_OPS, unsetHover } from "../../data/uiSlice";
// import Column, { COLUMN_STATUS_REMOVED, COLUMN_STATUS_VISABLE } from "../../lib/types/Column";
import { Column, COLUMN_STATUS_REMOVED } from "../../data/slices/sourceColumnsSlice";
import ColumnView from "./ColumnView";
import { isMouseOverElement } from "../../lib/utilities/dom";
import { removeTable, removeOperation } from "../../data/slices/compositeSchemaSlice";
import { getTableById } from "../../data/selectors";

export default function({node, parentOperation, columnCount}) {
    const {tableId} = node.data;
    const table = useSelector(state => getTableById(state, tableId));

    const [contextMenu, setContextMenu] = useState(null);
    const tableRef = useRef();
    const dispatch = useDispatch();

    const {stage, hover} = useSelector(({ui}) => ui);
    const isHovered = hover.dataType === "table" && hover.id === table.id;
    
    const state = [
        isHovered ? "hover" : undefined,
    ].filter(className => className).join(" ");

    const menuItems = [
        {
            label: `Remove ${table.name}`,
            isVisable: true,
            onClick: () => dispatch(removeTable(node.data.id))
        },{
            label: "Remove operation",
            isVisable: true,
            onClick: () => dispatch(removeOperation(node.data.parentId))
        },{
            // label: "Add table",
            // isVisable: true,
            // onClick: () => dispatch(setInsertionMode(ADD_TO_GROUP))
        },{
            label: "Select operation",
            isVisable: stage === STAGE_REFINE_OPS,
            onClick: () => dispatch(setSelectedOperation(parentOperation))
        }
    ];
    
    return (
        <>
            <div 
                ref={tableRef}
                data-id={table.id}
                className={`block table ${state}`}
                onMouseEnter={() => dispatch(setHover({dataType: "table", id: table.id}))}
                onMouseLeave={() => {
                    if (!contextMenu) {
                        dispatch(unsetHover());
                    }
                }}
                onContextMenu={handleContextMenu}
            >
                <div className="label">{table.name} <span className="column-count">({table.columnCount})</span></div>
                {Array.from(
                    {length: columnCount}, 
                    ( _, index ) => (
                    // TODO: to accomidate removed columns?
                    // .filter(column => column.status !== COLUMN_STATUS_REMOVED)                        
                    <ColumnView 
                        key={`${table.id}-${index}`} 
                        tableId={table.id}
                        index={index} 
                    />
                    )
                )}
            </div>
            <Menu
                open={contextMenu !== null}
                onClose={closeMenu}
                anchorReference="anchorPosition"
                anchorPosition={
                    (contextMenu !== null)
                    ? {top: contextMenu.mouseY, left: contextMenu.mouseX}
                    : undefined
                }
            >
                {menuItems
                    .filter(item => item.isVisable)
                    .map((item, i) => (
                        <MenuItem 
                            key={i}
                            onClick={(event) => {
                                item.onClick(event);
                                closeMenu(event);
                            }}
                        >
                            {item.label}
                        </MenuItem>
                    ))
                }
            </Menu>        
        </>
    );

    function closeMenu(event) {
        const {clientX, clientY} = event;
        const isHovered = isMouseOverElement(tableRef, clientX, clientY);
        if (!isHovered) {
            dispatch(unsetHover());
        }
        setContextMenu(null);        
    }

    function handleContextMenu(event) {
        event.preventDefault();
        setContextMenu(
            (contextMenu === null)
            ? {
                mouseX: event.clientX + 2,
                mouseY: event.clientY - 6
            }
            : null
        )
    }
}