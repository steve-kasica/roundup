/**
 * StackDetail.jsx
 * 
 * 
 */

import { useDispatch, useSelector } from "react-redux";
import { swapColumnPositions } from "../../../data/schemaSlice";
import { isTable } from "../../../lib/types/Table";
import "./StackDetail.scss"
import { scaleBand } from "d3";
import ColumnView from "./ColumnView";
import Column, { COLUMN_STATUS_NULLED, COLUMN_STATUS_REMOVED } from "../../../lib/types/Column";
import { setHoverColumnIndex, setHoverTable } from "../../../data/uiSlice";
import { setColumnProperty } from "../../../data/tableTreeSlice";

const X_AXIS_LABEL = "column index"
const Y_AXIS_LABEL = "table name";
const cellSize = 50;  // in height and width of cells (in pixels)

export default function StackDetail() {
    const dispatch = useDispatch();
    const {tables, hoverColumn} = useSelector(({tableTree, ui}) => ({
        tables: tableTree.tree
            .filter(node => (
                isTable(node) && 
                ui.selectedOperation && 
                node.operation_group === ui.selectedOperation.id))
            .map(table => ({
                ...table,
                columns: table.columns.filter(({status}) => status !== COLUMN_STATUS_REMOVED)
            })),
        hoverColumn: ui.hoverColumn
    }));

    // Reverses table order to match flex-direction (in-place)
    tables.reverse()

    const maxColumnCount = Math.max(...tables.map(table => table.columns.length));
    const columnPositions = Array.from({length: maxColumnCount}, (_, i) => i);

    const xScale = scaleBand(
        columnPositions,
        [0, maxColumnCount * cellSize]
    );

    return (
        (tables.length > 0) ? (
            <div>
                <p>Stack operation detail view</p>
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
                            onMouseEnter={() => dispatch(setHoverTable(table.id))}
                            onMouseLeave={() => dispatch(setHoverTable(null))}                            
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
                                    onClick={() => {
                                        const columns = tables
                                            .map(table => (j < table.columns.length) ? table.columns.at(j) : null)
                                            .filter(column => column);
                                        const isIndexSelected = columns.filter(column => column.isSelected).length === columns.length;
                                        if (isIndexSelected) {
                                            // If every column in the index is selected, unselect all columns in the index
                                            columns.forEach(column => dispatch(setColumnProperty({
                                                column,
                                                property: "isSelected",
                                                value: false
                                            })))
                                        } else {
                                            // Select all unselected columns in the index
                                            columns
                                                .filter(column => !column.isSelected)
                                                .forEach(column => dispatch(setColumnProperty({
                                                    column,
                                                    property: "isSelected",
                                                    value: true
                                                })))
                                        }
                                    }}
                                    onMouseEnter={() => dispatch(setHoverColumnIndex(j))}
                                    onMouseLeave={() => dispatch(setHoverColumnIndex(null))}
                                >
                                    <label>
                                        {j + 1}
                                    </label>
                                </div>
                                {tables.map(table => {
                                    const column = (j < table.columns.length)
                                        ? table.columns.at(j)
                                        :  new Column("null", j, "", {}, "", table.id, COLUMN_STATUS_NULLED);
                                    return <ColumnView 
                                        key={column.id} 
                                        column={column} 
                                        position={j + 1}
                                        columnCount={table.columns.length}
                                        tableName={table.name}
                                    />;
                                })}
                            </form>
                        ))}
                    </div>
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