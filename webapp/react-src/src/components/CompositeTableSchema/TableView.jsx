/**
 * CompositeTableSchema/TableView.jsx
 * -----------------------------------------------------------------
 * A visual representation of **source table** data in the 
 * **Table Tree**.
 */
import { Menu, MenuItem } from "@mui/material";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedOperation, STAGE_REFINE_OPS } from "../../data/uiSlice";
import Column, { COLUMN_STATUS_REMOVED, COLUMN_STATUS_VISABLE } from "../../lib/types/Column";
import { isOperation } from "../../lib/types/Operation";
import ColumnView from "./ColumnView";
import { createSelector } from "@reduxjs/toolkit";

// const selectTableTree = (state) => state.tableTree.tree;
// const selectStage = (state) => state.stage;

// const selectOperationAndStage = createSelector(
//     [selectTableTree, selectStage, (_, operation_group) => operation_group],
//     (tree, stage, operation_group) => ({
//         parentOperation: tree.find(d => isOperation(d) && d.id === operation_group),
//         stage
//     })
// );

export default function({node, parentOperation}) {
    const {tableId} = node;
    const table = useSelector(({sourceTables}) => sourceTables.data[tableId]);
    const columns = useSelector(({sourceColumns}) => sourceColumns.data[tableId] ?? Array.from({length: table.columnCount}, (_, i) => new Column('foo', i, null, {}, null, tableId, COLUMN_STATUS_VISABLE)));

    const [contextMenu, setContextMenu] = useState(null);
    const dispatch = useDispatch();

    const {stage} = useSelector(({ui}) => ui);
    // const {parentOperation, stage} = useSelector(
    //     state => selectOperationAndStage(state, operation_group)
    // );
    
    // const isHovered = columns.filter(column => column.isHovered).length > 0;
    const isHovered = false;
    const state = [
        isHovered ? "hover" : undefined,
    ].filter(className => className).join(" ");

    const menuItems = [
        {
            label: `Remove ${table.name}`,
            isVisable: true,
            onClick: () => dispatch(removeTable(table))
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
                data-id={tableId}
                className={`block table ${state}`}
                onContextMenu={handleContextMenu}
            >
                <div className="label">{table.name} <span className="column-count">({table.columnCount})</span></div>
                {columns
                    .filter(column => column.status !== COLUMN_STATUS_REMOVED)
                    .map((column) => <ColumnView key={column.id} column={column} />)}
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