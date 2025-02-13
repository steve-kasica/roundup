/**
 * Table.jsx
 * -----------------------------------------------------------------
 * A visual representation of **source table** data in the 
 * **Table Tree**.
 */
import { Menu, MenuItem } from "@mui/material";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setFocusedNode, setFocusedOperation } from "../../data/uiSlice";

export default function Table({node}) {
    const [contextMenu, setContextMenu] = useState(null);
    const dispatch = useDispatch();
    
    const { data:table } = node;
    const operation = node.parent.data;
    const isUnfocused = useSelector(({ui}) => (ui.focusedOperation !== null && ui.focusedOperation.id !== operation.id));

    const menuItems = [
        {
            label: "Remove table",
            onClick: () => dispatch(removeTableFromTree(table))
        },{
            label: "Remove group",
            onClick: () => dispatch(removeOperation(operation))
        },{
            label: "Add table to group",
            onClick: () => dispatch(setInsertionMode(ADD_TO_GROUP))
        },{
            label: "Select operation",
            onClick: () => dispatch(setFocusedOperation(operation))
        }
    ];
    
    return (
        <>
            <div 
                data-id={table.id} 
                className={`block table ${isUnfocused ? "unfocused" : ""}`}
                onContextMenu={handleContextMenu}
            >
                {table.name}
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
                {menuItems.map((item, i) => (
                    <MenuItem 
                        key={i}
                        onClick={(event) => {
                            item.onClick(event);
                            closeMenu();
                        }}
                    >
                        {item.label}
                    </MenuItem>
                ))}
            </Menu>        
        </>
    );
    
    function closeMenu() {
        setContextMenu(null);
    }

    function handleContextMenu(event) {
        event.preventDefault();
        dispatch(setFocusedNode(node.parent.data));
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