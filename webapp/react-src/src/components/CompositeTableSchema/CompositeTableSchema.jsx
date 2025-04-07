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
import { isOperationNode, isTableNode, stratify } from "../../data/slices/compositeSchemaSlice";

// const selectTable = (state) => state.tableTree.tree;

// const selectOperationTree = createSelector([selectTable]);
// const selectRoot = createSelector([selectTable], (tree) => {
//     if (tree.length === 0) {
//         return null;
//     }
//     return stratify(tree);
// });

export default function CompositeTableSchema() {
    // const root = useSelector(selectRoot);
    const root = useSelector(({sourceTables, compositeSchema}) => {
        if (compositeSchema.ids.length === 0) {
            return null;
        } else {
            const data = Object.values(compositeSchema.data).map(node => {
                if (isOperationNode(node)) {
                    return node;
                } else if (isTableNode(node)) {
                    return {
                        ...sourceTables.data[node.tableId].attributes,
                        tableId: node.tableId,
                        parentId: node.parentId
                    }
                } else {
                    throw Error("Unknown node type");
                }
            });
            return stratify(data);
        }
    });
    // console.log(root);
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