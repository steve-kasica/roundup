/**
 * Root.jsx
 * ---------------------------------------------------------------------
 */

import Grid from "@mui/material/Grid2"
import { Add as PlusIcon } from "@mui/icons-material"

import { isOperation, PACK, STACK } from "../../../lib/types/Operation"
import Operation from "./Operation"
import Table from "./Table"
import TableDropTarget from "./TableDropTarget"

const schemaSize = 10;

export default function Root({node}) {
    if (isOperation(node.data)) 
        return (
            <Grid container spacing={0.5}>
                <Grid size={schemaSize}>
                    <Operation node={node} />
                </Grid>
                <Grid size={12 - schemaSize}>
                    <TableDropTarget operationType={PACK}>
                        <PlusIcon />
                    </TableDropTarget>
                </Grid>
                <Grid size={schemaSize}>
                    <TableDropTarget operationType={STACK}>
                        <PlusIcon />
                    </TableDropTarget>
                </Grid>
            </Grid>
        )
    else
        return <Table node={node} />
}

