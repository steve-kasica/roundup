"use client"

import {useRef, useEffect} from 'react';
import Vis from "./TableStack.js";
import "./TableStack.css"
import * as d3 from "d3";

export default function TableStack({tables, onColumnSwap, focusIndex}) {
    const svgRef = useRef(null);
    const visRef = useRef(null);

    function onChangeHandler(a, b) {
        onColumnSwap(a.column, b.column);
        // setTables(state => {
        //     state
        //         .filter(t => t.name === source.y)
        //         [0].columns
        //         .forEach(c => { 
        //             if (c.key === source.key) {
        //                 c.index = source.x;
        //             } else if (c.key === target.key) {
        //                 c.index = target.x;
        //             }
        //         });
        //     return [...state];
        // });
    }
    
    useEffect(() => {
        if (visRef.current === null) {
            // Initialize
            visRef.current = new Vis({
                width: 400,
                height: 400,
                marginLeft: 50,
                marginTop: 20,
                marginRight: 0,
                marginBottom: 0,
                rectRoundness: 2,
                onDataChange: onChangeHandler
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
        <>
            <svg 
                className="table-stack"
                ref={svgRef}
            />
        </>
    )
}
