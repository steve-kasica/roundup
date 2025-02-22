/** 
 * CompositeTableSchema.js 
 * ------------------------------------------------------------------------------------------------
 * An interactive hierarchical visualization of the table tree
 */

import "./CompositeTableSchema.scss";

import { useSelector } from "react-redux";
import { stratify } from "../../data/tableTreeSlice";
import Root from "./Root";
import TableDropTarget from "./TableDropTarget";
import { Typography } from "@mui/material";
import { STACK } from "../../lib/types/Operation";

export default function CompositeTableSchema() {
    const root = useSelector(({tableTree}) => (tableTree.tree.length > 0)
        ? stratify(tableTree.tree)
        : null
    );

    return (<div className="CompositeTableSchema">
        <h3>Output table</h3>
        {
            (root !== null) ? (
                <Root node={root} />
            ) : ( 
                <TableDropTarget operationType={STACK}>
                    <Typography>
                        Add a source table
                    </Typography>
                </TableDropTarget>
            )
        }
    </div>);
}