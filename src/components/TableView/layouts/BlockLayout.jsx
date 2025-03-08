/**
 * Table.jsx
 * -----------------------------------------------------------------
 * A visual representation of **source table** data in the 
 * **Table Tree**.
 */
import { Menu, MenuItem } from "@mui/material";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setFocusedNode, setSelectedOperation, STAGE_REFINE_OPS } from "../../../data/uiSlice";
import ColumnView, {COLUMN_LAYOUT_TICK} from "../../ColumnView";
import { isTable } from "../../../lib/types/Table";
import Column, { COLUMN_STATUS_NULLED, COLUMN_STATUS_REMOVED } from "../../../lib/types/Column";
import { isOperation } from "../../../lib/types/Operation";

export default function BlockLayout({
    name,
    columns,
    id,
    operation_group,
    style,
    removeTableEvent,
    setIsHover,
}) {
    const [contextMenu, setContextMenu] = useState(null);
    const dispatch = useDispatch();

    const {maxColumns, parentOperation} = useSelector(({tableTree}) => ({
        maxColumns: Math.max(...tableTree.tree
            .filter(d => isTable(d) && d.operation_group === operation_group)
            .map(table => table.columns
                .filter(column => column.status !== COLUMN_STATUS_REMOVED)
                .length
            )),
        parentOperation: tableTree.tree.filter(d => isOperation(d) && d.id === operation_group).at(0)
    }));

    const validColumns = columns
        .filter(column => column.status !== COLUMN_STATUS_REMOVED);

    const visableColumns = Array.from(
        {length: maxColumns}, 
        (_,i) => (i < validColumns.length)
            ? validColumns.at(i)
            : new Column("null", i, undefined, undefined, undefined, id, COLUMN_STATUS_NULLED)
    );

    const {stage} = useSelector(({ui}) => ui);

    const menuItems = [
        {
            label: `Remove ${name}`,
            isVisable: true,
            onClick: removeTableEvent
        },{
            label: "Remove operation",
            isVisable: true,
            onClick: () => dispatch(removeOperation(parentOperation))
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
                data-id={id}
                className={`block table`}
                onContextMenu={handleContextMenu}
                style={style}
                onMouseEnter={() => setIsHover(true)}
                onMouseLeave={() => setIsHover(false)}
            >
                <div className="label">{name} <span className="column-count">({columns.length})</span></div>
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
                {menuItems
                    .filter(item => item.isVisable)
                    .map((item, i) => (
                        <MenuItem 
                            key={i}
                            onClick={(event) => {
                                item.onClick(event);
                                closeMenu();
                            }}
                        >
                            {item.label}
                        </MenuItem>
                    ))
                }
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