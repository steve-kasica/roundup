"use client"

import {useRef, useEffect} from 'react';
import Vis from "./TableStack.js";
import "./TableStack.css"

export default function TableStack({tables, onColumnSwap, focusIndex}) {
    const svgRef = useRef(null);
    const visRef = useRef(null);

    console.log("Component rendered");
    
    useEffect(() => {
        if (visRef.current === null) {
            // Initialize
            visRef.current = new Vis({
                width: undefined,
                height: undefined,
                marginLeft: 0,
                marginTop: 0,
                marginRight: 0,
                marginBottom: 0,
                rectRoundness: 2,
                cellSize: 100
                // onDataChange: (a,b) => onColumnSwap(a.column, b.column)
            },
            svgRef.current);
        } else if (tables.length > 0) {
            const selectedColumnIndices = new Set(tables
                .map(table => table.selectedColumns.map(column => column.index))
                .flat()
            );

            const data = tables
                .filter(table => table.isSelected)
                .map((table, i) => 
                    table.columns
                        .filter(column => selectedColumnIndices.has(column.index))
                        .map((column, j) => ({
                            x: j,
                            y: i,
                            key: column.key,
                            isFocused: column.index === focusIndex,
                            isEmpty: !column.isSelected,
                            title: column.name,
                            column: column
                        })))
                .flat();

            visRef.current.update(data);
        } else {
            visRef.current.update([]);
        }
    }, [tables, focusIndex]);

    return (
        <div className="overflow-x-scroll">
            <svg 
                className="table-stack"
                ref={svgRef}
            />
        </div>
    )
}
