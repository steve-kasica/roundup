
import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import {default as Vis } from "./ValueMatrix";

export default function({heading, tables, focusedIndex}) {
    const svgRef = useRef(null);
    const visRef = useRef(null);

    useEffect(() => {
        if (visRef.current === null) {
            // initialize
            visRef.current = new Vis({
                width: 200,
                marginTop: 50,
                marginLeft: 50
            }, svgRef.current);
        } else if (tables.filter(t => t.isSelected).length > 0) {
            let data = tables
                .map(t => t.columns)
                .flat()
                .filter(c => c.isSelected)
                .filter(c => c.index === focusedIndex)
                .map(c => Array.from(
                    Object.entries(c.values), 
                    ([value, count]) => ({
                        y: value,
                        x: c.table.name,
                        count,
                        key: `${c.table.index}-${value}`
                    })
                )).flat()
                .filter(d => d.y !== "NA");

            visRef.current.update(data);
        } else {
            visRef.current.update([]);
        }
    }), [tables, focusedIndex];

    return (<>
        <h3>{heading}</h3>
        <div>
            <svg ref={svgRef} />
        </div>
    </>);
}