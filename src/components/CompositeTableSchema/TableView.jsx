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
import { COLUMN_STATUS_REMOVED } from "../../lib/types/Column";
import { isOperation } from "../../lib/types/Operation";
import ColumnView from "./ColumnView";

export default function({table}) {
    const {name, id, columns, operation_group} = table;

    const [contextMenu, setContextMenu] = useState(null);
    const dispatch = useDispatch();

    const {parentOperation, stage} = useSelector(({tableTree, ui}) => ({
        parentOperation: tableTree.tree.filter(d => isOperation(d) && d.id === operation_group).at(0),
        stage: ui.stage,
    }));

    const menuItems = [
        {
            label: `Remove ${name}`,
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

    const isHovered = columns.filter(column => column.isHovered).length > 0;
    const state = [
        isHovered ? "hover" : undefined,
    ].filter(className => className).join(" ");
    
    return (
        <>
            <div 
                data-id={id}
                className={`block table ${state}`}
                onContextMenu={handleContextMenu}
            >
                <div className="label">{name} <span className="column-count">({columns.length})</span></div>
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