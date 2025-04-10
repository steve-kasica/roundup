/** 
 * CompositeTableSchema.js 
 * ------------------------------------------------------------------------------------------------
 * An interactive hierarchical visualization of the table tree
 */

import "./CompositeTableSchema.scss";

import { useSelector } from "react-redux";
import Root from "./Root";
import TableDropTarget from "./TableDropTarget";
import { Typography } from "@mui/material";
import { NO_OP } from "../../lib/types/Operation";
import { createSelector } from "@reduxjs/toolkit";
import { isTable } from "../../lib/types/Table";
import { isOperationNode, isTableNode, stratify } from "../../data/slices/compositeSchemaSlice/compositeSchemaSlice";

// const selectTable = (state) => state.tableTree.tree;

// const selectOperationTree = createSelector([selectTable]);
// const selectRoot = createSelector([selectTable], (tree) => {
//     if (tree.length === 0) {
//         return null;
//     }
//     return stratify(tree);
// });

export default function CompositeTableSchema() {
    const root = useSelector(({compositeSchema}) => 
        (Object.keys(compositeSchema.data).length > 0)
            ? stratify(Object.values(compositeSchema.data))    
            : null
    );
    const {stage} = useSelector(({ui}) => ui);

    return (<div className={`CompositeTableSchema ${stage}`}>
        <h3>Composite Table Schema</h3>
        {
            (root !== null) ? (
                <Root node={root} />
            ) : ( 
                <TableDropTarget operationType={NO_OP}>
                    <Typography>
                        Add a source table
                    </Typography>
                </TableDropTarget>
            )
        }
    </div>);
}