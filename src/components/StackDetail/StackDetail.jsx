/**
 * StackDetail.jsx
 * 
 * 
 */

import StackHeader from "./StackHeader";
import { useDispatch, useSelector } from "react-redux";
import { swapColumnPositions } from "../../data/schemaSlice";
import { isTable } from "../../lib/types/Table";
import StackRow from "./StackRow";
import "./style.css"

const multipleValuesText = "...";

export default function StackDetail() {
    const dispatch = useDispatch();

    // const {data} = useSelector(({ schema }) => {
    //     return {
    //         data: schema.data,
    //         error: schema.error
    //     };
    // });

    const data = useSelector(({tableTree, ui}) => tableTree.tree
        .filter(node => isTable(node) && node.operation_group === ui.focusedOperation.id)
    );

    const columnCount = Math.max(...data.map(table => table.column_count))

    return (
        <table className="stack-detail">
            <thead className="x axis">
                {Array.from({length: columnCount}, (_, i) => (
                    <td key={i}>{(i > 0) ? i : null}</td>
                ))}
            </thead>
            {/* <StackHeader
                data={data}
                focusIndex={null}
            /> */}
            <tbody>
                {data.map(table => (
                    <StackRow 
                        key={table.id}
                        table={table}
                        focusIndex={null}
                        onCellSwap={onCellSwap}
                    />
                ))}
            </tbody>
        </table>
    );

    function onCellSwap(columnA, columnB, tableId) {
        dispatch(swapColumnPositions(columnA, columnB, tableId))
    }
}