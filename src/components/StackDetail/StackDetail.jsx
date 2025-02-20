/**
 * StackDetail.jsx
 * 
 * 
 */

import { useDispatch, useSelector } from "react-redux";
import { swapColumnPositions } from "../../data/schemaSlice";
import { isTable } from "../../lib/types/Table";
import {CELL_WIDTH} from "./StackRow";
import "./StackDetail.scss"
import { scaleBand } from "d3";
import StackCell from "./StackCell";
import { COLUMN_STATUS_REMOVED } from "../../lib/types/Column";
import { setFocusedColumnIndex } from "../../data/uiSlice";

const X_AXIS_LABEL = "column index"
const Y_AXIS_LABEL = "table name";
const HEADER_HEIGHT = 20;  // height of a header row in pixels
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

    const tableCount = tables.length;
    const maxColumnCount = Math.max(...tables.map(table => table.columns.length));
    const columnPositions = Array.from({length: maxColumnCount}, (_, i) => i);

    const yScale = scaleBand(Array.from({length: tables.length}, (_,i) => i), [0, tableCount * cellSize]);
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
                            <div 
                                key={j}
                                className={`grid-column ${j === focusedColumnIndex ? "focused" : ""}`}
                                onClick={() => dispatch(setFocusedColumnIndex(j))}
                                onContextMenu={() => dispatch(setFocusedColumnIndex(j))}
                            >
                                <div className="index-label">
                                    {j + 1}
                                </div>
                                {tables.map(table => (
                                    j < table.columns.length
                                        ? (
                                            <StackCell 
                                                key={`${table.id}-${j}`}
                                                columnIndex={j}
                                                column={(j < table.columns.length) ? table.columns.at(j) : null}
                                            />
                                        )
                                        : null

                                ))}
                            </div>
                        ))}
                        {/* {tables.map(table => (
                            <div className="StackRow">
                                {table.columns.map((column, j) => (
                                <StackCell 
                                    key={`${column.tableId}-${column.id}`}                            
                                    column={column} 
                                    style={{
                                        // height: `${yScale.bandwidth()}px`,
                                        // width: `${xScale.bandwidth()}px`,
                                        // top: `${yScale(i)}px`,
                                        // left: `${xScale(j)}px`
                                    }}
                                />
                                ))}
                            </div>
                        ))} */}
                    </div>

                </div>
                {/* <div className="main">

                    
                    <div className="gridgrid">
                        <div className="stack-grid">
                        
                        {/* <div 
                            className="header"
                            style={{
                                height: `${HEADER_HEIGHT}px`,
                                lineHeight: `${HEADER_HEIGHT}px`
                            }}
                        >

                        </div> {/* end div.header }            
                        {tables.map(table => (
                        <StackRow 
                            key={table.id}
                            table={table}
                            focusIndex={null}
                            onCellSwap={onCellSwap}
                        />
))} end}
                    </div> 
                </div>
                </div>                 */}
        </div>
        ) : null
    );

    function onCellSwap(columnA, columnB, tableId) {
        dispatch(swapColumnPositions(columnA, columnB, tableId))
    }
}