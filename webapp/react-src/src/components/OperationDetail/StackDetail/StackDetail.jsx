/**
 * StackDetail.jsx
 * 
 * The main entrypoint for the Stack Detail Component. This component provides details about the
 * stack operation
 */

import { useDispatch, useSelector } from "react-redux";
import "./StackDetail.scss"
import { scaleBand } from "d3";
import ColumnView from "./ColumnView";
import { getFocusedOperationTablesWithColumns } from "../../../data/selectors";
import { hoverColumnIndex, hoverTable, unhoverColumnIndex, unhoverTable } from "../../../data/uiSlice";

function setColumnProperty() {
    // TODO need up update column name
}

const X_AXIS_LABEL = "column index"
const Y_AXIS_LABEL = "table name";
const cellSize = 50;  // in height and width of cells (in pixels)

export default function StackDetail() {
    const dispatch = useDispatch();
    const tables = useSelector(getFocusedOperationTablesWithColumns);

    const maxColumnCount = Math.max(...tables.map(table => table.columnCount));
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
                            onMouseEnter={() => dispatch(hoverTable(table.id))}
                            onMouseLeave={() => dispatch(unhoverTable())}
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
                            >
                                <div 
                                    className="index-label"
                                    // onClick={() => {
                                    //     const columns = tables
                                    //         .map(table => (j < table.columnCount) ? table.columns.at(j) : null)
                                    //         .filter(column => column);
                                    //     // const isIndexSelected = columns.filter(column => column.isSelected).length === columns.length;
                                    //     const isIndexSelected = false;
                                    //     if (isIndexSelected) {
                                    //         // If every column in the index is selected, unselect all columns in the index
                                    //         columns.forEach(column => dispatch(setColumnProperty({
                                    //             column,
                                    //             property: "isSelected",
                                    //             value: false
                                    //         })))
                                    //     } else {
                                    //         // Select all unselected columns in the index
                                    //         columns
                                    //             .filter(column => !column.isSelected)
                                    //             .forEach(column => dispatch(setColumnProperty({
                                    //                 column,
                                    //                 property: "isSelected",
                                    //                 value: true
                                    //             })))
                                    //     }
                                    // }}
                                    onMouseEnter={() => dispatch(hoverColumnIndex(j))}
                                    onMouseLeave={() => dispatch(unhoverColumnIndex())}
                                >
                                    <label>
                                        {j + 1}
                                    </label>
                                </div>
                                {tables.map(table => (
                                    <ColumnView 
                                        key={`${table.id}-${j}`}
                                        tableId={table.id}                                        
                                        columnId={table.columnIds[j]}  // undefined (out of bounds) is allowed
                                        position={j + 1}
                                        columnCount={table.columnCount}
                                        tableName={table.name}
                                    />)
                                )}
                            </form>
                        ))}
                    </div>
                </div>
            </div>
        ) : null
    );
}