/**
 * CompositeTableSchema/TableView.jsx
 * -----------------------------------------------------------------
 * A visual representation of **source table** data in the 
 * **Table Tree**.
 */
import { Menu, MenuItem } from "@mui/material";
import { useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { isMouseOverElement } from "../../lib/utilities/dom.js";
import ColumnContainer, { COLUMN_LAYOUT_BLOCK } from "../ColumnContainer";

// export default function({node, parentOperation, columnCount}) {
export default function TableBlockView({
    id, 
    name, 
    rowCount, 
    columnCount, 
    dateCreated, 
    dateLastModified, 
    tags, 
    isHovered,
    handleOnHover,
    handleOffHover,
    handleRemoveTable,
    handleRemoveOperation,
    handleSelectOperation,
}) {
    const dispatch = useDispatch();    
    const [contextMenu, setContextMenu] = useState(null);
    const tableRef = useRef();

    const menuItems = [
        {
            label: `Remove ${name}`,
            isVisable: true,
            onClick: handleRemoveTable
        },{
            label: "Remove operation",
            isVisable: true,
            onClick: handleRemoveOperation
        },{
            label: "Select operation",
            isVisable: false,
            onClick: handleSelectOperation
        }
    ];
    
    return (
        <>
            {/* <div 
                ref={tableRef}
                data-id={id}
                onContextMenu={handleContextMenu}
            > */}
                <div className="label">{name} <span className="column-count">({columnCount})</span></div>
                {Array.from(
                    {length: columnCount}, 
                    ( _, columnIndex ) => (
                    <ColumnContainer 
                        key={`${id}-${columnIndex}`} 
                        tableId={id}
                        columnIndex={columnIndex} 
                        layout={COLUMN_LAYOUT_BLOCK}
                    />
                    )
                )}
            {/* </div> */}

            {/* <Menu
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
            </Menu>         */}
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