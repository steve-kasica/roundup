/**
 * Root.jsx
 * ---------------------------------------------------------------------
 */

import Grid from "@mui/material/Grid2"
import { Add as PlusIcon } from "@mui/icons-material"

import { isOperation, PACK, STACK } from "../../lib/types/Operation"
import Operation from "./Operation"
import Table from "./Table"
import TableDropTarget from "./TableDropTarget"
import { useSelector } from "react-redux"
import { STAGE_ARRANGE_TABLES } from "../../data/uiSlice"
import { interpolateCividis, interpolateCool, interpolateGreys, interpolatePlasma, scaleSequential } from "d3";

const GRID_COLUMNS = 12;

export default function Root({node}) {
    const {stage} = useSelector(({ui}) => ui);
    const gridWidth = stage === STAGE_ARRANGE_TABLES ? GRID_COLUMNS - 2 : GRID_COLUMNS;
    const colorScale = scaleSequential([node.height + 1, -1], interpolateGreys);

    if (isOperation(node.data)) 
        return (
            <Grid container spacing={0.5}>
                <Grid size={gridWidth}>
                    <Operation node={node} colorScale={colorScale}/>
                </Grid>
                {(stage === STAGE_ARRANGE_TABLES) ? (
                <>
                    <Grid size={GRID_COLUMNS - gridWidth}>
                        <TableDropTarget operationType={PACK}>
                            <PlusIcon />
                        </TableDropTarget>
                    </Grid>
                    <Grid size={gridWidth}>
                        <TableDropTarget operationType={STACK}>
                            <PlusIcon />
                        </TableDropTarget>
                    </Grid>
                </>                    
                ) : null
                }
            </Grid>
        )
    else
        return <Table node={node} />
}

