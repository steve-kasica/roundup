// /**
//  * Root.jsx
//  * ---------------------------------------------------------------------
//  */

// import Grid from "@mui/material/Grid2"
// import { Add as PlusIcon } from "@mui/icons-material"

// import { PACK_OPERATION, STACK_OPERATION } from "../../data/slices/compositeSchemaSlice"
// import { isOperationNode } from "../../data/slices/compositeSchemaSlice"
// import OperationView from "../OperationContainer/OperationBlockView"
// import TableDropTarget from "./TableDropTarget"
// import { useSelector } from "react-redux"
// import { STAGE_ARRANGE_TABLES } from "../../data/uiSlice"
// import { interpolateGreys, scaleSequential } from "d3";
// import TableView from "../TableContainer/TableBlockView"

// const GRID_COLUMNS = 12;

// export default function Root({node}) {
//     const {stage} = useSelector(({ui}) => ui);
//     const gridWidth = stage === STAGE_ARRANGE_TABLES ? GRID_COLUMNS - 2 : GRID_COLUMNS;
//     const colorScale = scaleSequential([node.height + 1, -1], interpolateGreys);

//     if (isOperationNode(node.data))
//         return (
//             <Grid container spacing={0.5}>
//                 <Grid size={gridWidth}>
//                     <OperationView
//                         node={node}
//                         colorScale={colorScale}
//                     />
//                 </Grid>
//                 {(stage === STAGE_ARRANGE_TABLES) ? (
//                 <>
//                     <Grid size={GRID_COLUMNS - gridWidth}>
//                         <TableDropTarget operationType={PACK_OPERATION}>
//                             <PlusIcon />
//                         </TableDropTarget>
//                     </Grid>
//                     <Grid size={gridWidth}>
//                         <TableDropTarget operationType={STACK_OPERATION}>
//                             <PlusIcon />
//                         </TableDropTarget>
//                     </Grid>
//                 </>
//                 ) : null
//                 }
//             </Grid>
//         )
//     else
//         return <TableView node={node.data} />
// }
