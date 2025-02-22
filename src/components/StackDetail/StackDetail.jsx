/**
 * StackDetail.jsx
 * 
 * 
 */

import { useDispatch, useSelector } from "react-redux";
import { swapColumnPositions } from "../../data/schemaSlice";
import { isTable } from "../../lib/types/Table";
import "./StackDetail.scss"
import { scaleBand } from "d3";
import StackCell from "./StackCell";
import { COLUMN_STATUS_REMOVED } from "../../lib/types/Column";
import { setFocusedColumnIndex } from "../../data/uiSlice";

const X_AXIS_LABEL = "column index"
const Y_AXIS_LABEL = "table name";
const cellSize = 50;  // in height and width of cells (in pixels)

export default function StackDetail() {
    const dispatch = useDispatch();

    const {tables, focusedColumnIndex} = useSelector(({tableTree, ui}) => ({
        tables: tableTree.tree
            .filter(node => (
                isTable(node) && 
                ui.focusedOperation && 
                node.operation_group === ui.focusedOperation.id))
            .map(table => ({
                ...table,
                columns: table.columns.filter(({status}) => status !== COLUMN_STATUS_REMOVED)
            })),
        focusedColumnIndex: ui.focusedColumnIndex
    }));

    const maxColumnCount = Math.max(...tables.map(table => table.columns.length));
    const columnPositions = Array.from({length: maxColumnCount}, (_, i) => i);

    const xScale = scaleBand(
        columnPositions,
        [0, maxColumnCount * cellSize]
    );

    return (
        (tables.length > 0) ? (
            <div className="StackDetail">
                <div className="left-panel">
                    <div className="label">
                        <span>{Y_AXIS_LABEL}</span>
                    </div>
                    <div className="ticks">
                    {tables.map(table => (
                        <div 
                            key={table.id}
                            className="tick"
                        >
                            {table.name}
                        </div>
                    ))}
                    </div>
                </div>
                <div className="right-panel">
                    <div className="x-axis label">
                            {X_AXIS_LABEL}
                    </div>
                    <div className="grid-container">
                        {xScale.domain().map(j => (
                            <form 
                                key={j}
                                className={`${(focusedColumnIndex !== null && focusedColumnIndex !== j) ? "unhovered" : ""}`}
                                onMouseEnter={() => dispatch(setFocusedColumnIndex(j))}
                                onMouseLeave={() => dispatch(setFocusedColumnIndex(null))}
                            >
                                <label className="index-label">
                                    {j + 1}
                                </label>
                                {tables.map(table => (
                                    j < table.columns.length
                                        ? (
                                            <StackCell 
                                                key={`${table.id}-${j}`}
                                                columnIndex={j}
                                                column={table.columns.at(j)}
                                            />
                                        )
                                        : null

                                ))}
                            </form>
                        ))}
                    </div>
                </div>
        </div>
        ) : null
    );

    // TODO: implement cell swaping action
    // function onCellSwap(columnA, columnB, tableId) {
    //     dispatch(swapColumnPositions(columnA, columnB, tableId))
    // }
}