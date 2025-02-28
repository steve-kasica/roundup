/**
 * Table.jsx
 * -----------------------------------------------------------------
 * A visual representation of **source table** data in the 
 * **Table Tree**.
 */
import { Menu, MenuItem } from "@mui/material";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setFocusedNode, setFocusOperation, STAGE_REFINE_OPS } from "../../../data/uiSlice";
import ColumnView, {COLUMN_LAYOUT_TICK} from "../../ColumnView";
import { isTable } from "../../../lib/types/Table";
import Column, { COLUMN_STATUS_NULLED, COLUMN_STATUS_REMOVED } from "../../../lib/types/Column";

export default function BlockLayout({
    name,
    columns,
    id,
    operation_group,
    style
}) {
    const [contextMenu, setContextMenu] = useState(null);
    const dispatch = useDispatch();

    const maxColumns = useSelector(({tableTree}) => Math.max(
        ...tableTree.tree
            .filter(node => isTable(node) && node.operation_group === operation_group)
            .map(table => table.columns
                .filter(column => column.status !== COLUMN_STATUS_REMOVED)
                .length
            )
    ));
    
    // const { data:table } = node;
    // const operation = node.parent.data;
    // const maxColumns = node.parent.children
    //         .map(n => n.data)
    //         .filter(d =>  isTable(d))
    //         .reduce((acc, d) => Math.max(
    //             acc, 
    //             d.columns.filter(c => c.status !== COLUMN_STATUS_REMOVED).length
    //         ), 0);
    const validColumns = columns
        .filter(column => column.status !== COLUMN_STATUS_REMOVED);

    const visableColumns = Array.from(
        {length: maxColumns}, 
        (_,i) => (i < validColumns.length)
            ? validColumns.at(i)
            : new Column("null", i, undefined, useDispatch, useDispatch, id, COLUMN_STATUS_NULLED)
    );

    const {hoverOperation, stage} = useSelector(({ui}) => ui);
    const isUnfocused = (hoverOperation !== null && hoverOperation.id !== operation.id);

    const menuItems = [
        {
            label: "Remove table",
            onClick: () => dispatch(removeTableFromTree(table))
        },{
            label: "Remove operation",
            onClick: () => dispatch(removeOperation(operation))
        },{
            label: "Add table",
            onClick: () => dispatch(setInsertionMode(ADD_TO_GROUP))
        },{
            label: "Select operation",
            onClick: () => dispatch(setFocusOperation(operation))
        }
    ];
    
    return (
        <>
            <div 
                data-id={id}
                className={`block table ${isUnfocused ? "unfocused" : ""}`}
                onContextMenu={handleContextMenu}
                style={style}
            >
                <div className="label">{name} ({columns.length})</div>
                {
                visableColumns.map((column) => (
                    <ColumnView 
                        key={column.id}
                        column={column}     
                        layout={COLUMN_LAYOUT_TICK}
                    />
                ))
                }
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
        // dispatch(setFocusedNode(node.parent.data));
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