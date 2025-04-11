/**
 * StackDetail.jsx
 * 
 * The main entrypoint for the Stack Detail Component. This component provides details about the
 * stack operation
 */

import { useDispatch, useSelector } from "react-redux";
import { isTable } from "../../../lib/types/Table";
import "./StackDetail.scss"
import { scaleBand } from "d3";
import ColumnView from "./ColumnView";
import { COLUMN_STATUS_REMOVED } from "../../../lib/types/Column";
import { createSelector } from "@reduxjs/toolkit";

function setColumnProperty() {
    // TODO
}

function setTableHover() {
    // TODO
}

function setColumnHover() {
    // TODO
}

const X_AXIS_LABEL = "column index"
const Y_AXIS_LABEL = "table name";
const cellSize = 50;  // in height and width of cells (in pixels)

const selectTree = state => state.tableTree.tree;
const selectSelectedOperation = state => state.ui.selectedOperation;

const selectedTablesByOperation = createSelector(
    [selectTree, selectSelectedOperation],
    (tree, selectedOperation) => {
        // Only process if we have a selected operation
        if (!selectSelectedOperation) return new Array();

        const tables = tree
            .filter(node => (
                isTable(node) && node.operation_group === selectedOperation.id)
            )
            .map(table => ({
                ...table,
                columns: table.columns.filter(({status}) => status !== COLUMN_STATUS_REMOVED)
            }));
        // Reverses table order to match flex-direction (in-place)            
        tables.reverse();

        return tables;
    }
);

export default function StackDetail() {
    const dispatch = useDispatch();
    const tables = useSelector(selectedTablesByOperation);




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
                            onMouseEnter={() => dispatch(setTableHover({
                                tableId: table.id, 
                                isHovered: true
                            }))}
                            onMouseLeave={() => dispatch(setTableHover({
                                tableId: table.id, 
                                isHovered: false
                            }))}
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
                                    onMouseEnter={() => dispatch(setColumnIndexHover({
                                        tableIds: tables.map(table => table.id),
                                        index: j,
                                        isHovered: true
                                    }))}
                                    onMouseLeave={() => dispatch(setColumnIndexHover({
                                        tableIds: tables.map(table => table.id),
                                        index: j,
                                        isHovered: false
                                    }))}
                                >
                                    <label>
                                        {j + 1}
                                    </label>
                                </div>
                                {tables.map(table => {
                                    const column = table.columns.at(j);
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
}