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
import { createSelector } from "@reduxjs/toolkit";

const selectTable = (state) => state.tableTree.tree;
const selectRoot = createSelector([selectTable], (tree) => {
    if (tree.length === 0) {
        return null;
    }
    return stratify(tree);
});

export default function CompositeTableSchema() {
    const root = useSelector(selectRoot);
    const {stage} = useSelector(({ui}) => ui)

    return (<div className={`CompositeTableSchema ${stage}`}>
        <h3>Composite Table Schema</h3>
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