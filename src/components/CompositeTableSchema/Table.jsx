/**
 * Table.jsx
 * -----------------------------------------------------------------
 * A visual representation of **source table** data in the 
 * **Table Tree**.
 */
import { Menu, MenuItem } from "@mui/material";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setFocusedNode, setFocusedOperation, STAGE_REFINE_OPS } from "../../data/uiSlice";
import ColumnView, {COLUMN_LAYOUT_TICK} from "../ColumnView";
import { isTable } from "../../lib/types/Table";
import { COLUMN_STATUS_REMOVED } from "../../lib/types/Column";

export default function Table({node, colorScale}) {
    const [contextMenu, setContextMenu] = useState(null);
    const dispatch = useDispatch();
    
    const { data:table } = node;
    const operation = node.parent.data;
    const maxColumns = node.parent.children
            .map(n => n.data)
            .filter(d =>  isTable(d))
            .reduce((acc, d) => Math.max(
                acc, 
                d.columns.filter(c => c.status !== COLUMN_STATUS_REMOVED).length
            ), 0);

    const {focusedOperation, stage} = useSelector(({ui}) => ui);
    const isUnfocused = (focusedOperation !== null && focusedOperation.id !== operation.id);

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
            onClick: () => dispatch(setFocusedOperation(operation))
        }
    ];
    
    return (
        <>
            <div 
                data-id={table.id} 
                className={`block table ${isUnfocused ? "unfocused" : ""}`}
                onContextMenu={handleContextMenu}
                style={{ backgroundColor: colorScale(node.height + 1) }}
            >
                <div className="label">{table.name} ({table.columns.length})</div>
                <div className="columns">
                {
                    (stage === STAGE_REFINE_OPS) ? (
                        table.columns
                            .filter(column => column.status !== COLUMN_STATUS_REMOVED)
                            .map(column => (
                                <ColumnView 
                                    key={column.id}
                                    column={column}     
                                    layout={COLUMN_LAYOUT_TICK}                               
                                    colorScale={colorScale}
                                    height={node.height}
                                    style={{
                                        width: `${(1 / maxColumns) * 100}%`,
                                    }}
                                />
                        ))
                    ) : null
                }
                </div>
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