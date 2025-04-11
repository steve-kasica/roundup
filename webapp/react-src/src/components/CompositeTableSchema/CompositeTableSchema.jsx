/** 
 * CompositeTableSchema.js 
 * ------------------------------------------------------------------------------------------------
 * An interactive hierarchical visualization of the table tree
 */

import "./CompositeTableSchema.scss";

import { useSelector } from "react-redux";
import { getRoot } from "../../data/selectors";

import Root from "./Root";
import TableDropTarget from "./TableDropTarget";
import { Typography } from "@mui/material";
import { NO_OP } from "../../data/slices/compositeSchemaSlice/types/OperationNode";

export default function CompositeTableSchema() {
    const root = useSelector(getRoot);
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