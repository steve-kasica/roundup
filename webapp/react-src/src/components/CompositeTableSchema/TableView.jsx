/**
 * CompositeTableSchema/TableView.jsx
 * -----------------------------------------------------------------
 * A visual representation of **source table** data in the 
 * **Table Tree**.
 */
import { Menu, MenuItem } from "@mui/material";
import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedOperation, STAGE_REFINE_OPS, unhoverTable, hoverTable } from "../../data/uiSlice";
import ColumnView from "./ColumnView";
import { isMouseOverElement } from "../../lib/utilities/dom";
import { removeTable, removeOperation } from "../../data/slices/compositeSchemaSlice";
import { getHoverTable, getTableById } from "../../data/selectors.js";

export default function({node, parentOperation, columnCount}) {
    const {tableId} = node.data;
    const table = useSelector(state => getTableById(state, tableId));

    const [contextMenu, setContextMenu] = useState(null);
    const tableRef = useRef();
    const dispatch = useDispatch();

    const {stage} = useSelector(({ui}) => ui);
    const hoverTableId = useSelector(getHoverTable);

    const isHovered = hoverTableId === table.id;    
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
                onMouseEnter={() => (!isHovered) ? dispatch(hoverTable(table.id)) : null}
                onMouseLeave={() => (!contextMenu) ? dispatch(unhoverTable()) : null}
                onContextMenu={handleContextMenu}
            >
                <div className="label">{table.name} <span className="column-count">({table.columnCount})</span></div>
                {Array.from(
                    {length: columnCount}, 
                    ( _, columnIndex ) => (
                    // TODO: to accomidate removed columns?
                    // .filter(column => column.status !== COLUMN_STATUS_REMOVED)                        
                    <ColumnView 
                        key={`${table.id}-${columnIndex}`} 
                        tableId={table.id}
                        columnIndex={columnIndex} 
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