/**
 * StackDetail.jsx
 * 
 * 
 */

import { useDispatch, useSelector } from "react-redux";
import { swapColumnPositions } from "../../data/schemaSlice";
import { isTable } from "../../lib/types/Table";
import StackRow, {CELL_WIDTH} from "./StackRow";
import "./style.css"

const multipleValuesText = "...";

const X_AXIS_LABEL = "column index"
const Y_AXIS_LABEL = "table name";
const HEADER_HEIGHT = 20;  // height of a header row in pixels

export default function StackDetail() {
    const dispatch = useDispatch();

    const data = useSelector(({tableTree, ui}) => tableTree.tree
        .filter(node => (
            isTable(node) && 
            ui.focusedOperation && 
            node.operation_group === ui.focusedOperation.id))
    );

    const columnCount = Math.max(...data.map(table => table.column_count));

    return (
        (data.length > 0) ? (
            <div className="container">
                <div className="y axis">
                    <span className="label" style={{
                        marginTop: `${HEADER_HEIGHT  * 2}px`
                    }}>
                        {Y_AXIS_LABEL}                        
                    </span> 
                </div>
                <div 
                    className="sidebar"
                >
                    <div 
                        className="row-label"
                        style={{
                            height: `${HEADER_HEIGHT * 2}px`,
                            lineHeight: `${HEADER_HEIGHT * 2}px`
                        }}
                    >
                        &nbsp;
                    </div>
                    {data.map(table => (
                        <div 
                            className="row-label"
                            style={{
                                height: `${CELL_WIDTH}px`,
                                lineHeight: `${CELL_WIDTH}px`
                            }}
                        >
                            {table.name}
                        </div>
                    ))}
                </div>
                <div className="main">
                    <div 
                        className="x axis"
                        style={{
                            height: `${HEADER_HEIGHT}px`,
                            lineHeight: `${HEADER_HEIGHT}px`
                        }}
                    >
                        {X_AXIS_LABEL}
                    </div>
                    <div className="body">
                    <div 
                        className="header"
                        style={{
                            height: `${HEADER_HEIGHT}px`,
                            lineHeight: `${HEADER_HEIGHT}px`
                        }}
                    >
                    {Array.from({length: columnCount}, (_, i) => (
                    <div 
                        key={i}
                        className="head"
                        style={{
                            width: `${CELL_WIDTH}px`,
                            left: `${CELL_WIDTH * i}px`
                        }}
                    >
                        {i + 1}
                    </div>
                    ))}
                    </div> {/* end div.header */}            
                    {data.map(table => (
                    <StackRow 
                        key={table.id}
                        table={table}
                        focusIndex={null}
                        onCellSwap={onCellSwap}
                    />
                    ))}
                </div> {/* end div.body */}
                </div>                
        </div>
        ) : null
    );

    function onCellSwap(columnA, columnB, tableId) {
        dispatch(swapColumnPositions(columnA, columnB, tableId))
    }
}