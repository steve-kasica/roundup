/** 
 * TableStack.js 
 * ------------------------------------------------------------------------------------------------
 * An interactive hierarchical visualization of the table tree
 */
import { useDispatch, useSelector } from "react-redux";

import "./TableStack.css";
import { addTableToTree, stratify } from "../../../data/tableTreeSlice";
import Root from "./Root";
import TableDropTarget from "./TableDropTarget";
import { Typography } from "@mui/material";

export default function() {
    const dispatch = useDispatch();
    const root = useSelector(({tableTree}) => (tableTree.isEmpty)
        ? null
        : stratify(tableTree.tree)
    );

    return (<>
        <h3>Output table</h3>
        {
            (root !== null) ? (
                <Root node={root} />
            ) : ( 
                <TableDropTarget
                    drop={(table) => dispatch(addTableToTree(table))}
                >
                    <Typography>
                        Add a source table
                    </Typography>
                </TableDropTarget>
            )
        }
    </>);
}