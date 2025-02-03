/* 
 * TableStack.js 
 */
import { useDispatch, useSelector } from "react-redux";
import { Fragment, useState } from "react";

import { isOperation } from "../../../lib/types/Operation";
import "./style.css";
import { Menu, MenuItem } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { ADD_TO_GROUP, setFocusedNode, setInsertionMode } from "../../../data/uiSlice";
import { removeOperation, removeTableFromTree, stratify } from "../../../data/tableTreeSlice";

export default function() {
    const dispatch = useDispatch();
    const root = useSelector(({tableTree}) => (tableTree.isEmpty)
        ? null
        : stratify(tableTree.tree)
    );

    return (<>
        <h3>Table stack</h3>
        <Grid container spacing={1}>
            <Grid size={11} style={{minHeight: "50px"}}>
                {
                    (root !== null) ? (
                        <DynamicBlock node={root} />
                    ) : ( null
                        // <Button 
                        //     style={{
                        //         width: "100%", 
                        //         height: "100%"
                        //     }}
                        // >
                        //         +
                        // </Button>
                    )
                }
            </Grid>
            <Grid size={1}>
                {/* <Button 
                    isdisabled={true}
                    style={{
                        width: "100%",
                        height: "100%"
                    }}
                >
                    +
                </Button>                         */}
            </Grid>
            <Grid size={11}>
                {/* <Button 
                    disabled={isRootEmpty}
                    onClick={handleStackTableClick}
                    style={{width: "100%"}}
                >
                    +
                </Button> */}
            </Grid>
        </Grid>
    </>);

    // function handleStackTableClick() {
    //     dispatch(setAppMode(MODE_STACK_TABLE));
    // }
}

function DynamicBlock({node}) {
    if (isOperation(node.data)) 
        return <OperationBlock node={node} />
    else
        return <TableBlock node={node} />
}

function TableBlock({node}) {
    const [contextMenu, setContextMenu] = useState(null);
    const dispatch = useDispatch();

    const { data:table } = node;
    const operation = node.parent.data;

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
        }
    ];

    return (
        <>
            <div 
                data-id={table.id} 
                className="block table"
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

function OperationBlock({node}) {
    const {data, children} = node;
    return (
        <div data-id={data.id} className="block operation">
            {children.map(childNode => (
                <Fragment key={childNode.data.id}>
                    <DynamicBlock node={childNode} />
                </Fragment>
            ))}  
        </div>
    );    
}