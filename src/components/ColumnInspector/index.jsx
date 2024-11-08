/**
 * ColumnInspector/index.jsx 
 * -------------------------------------------------------------------------------
 */
import { useEffect, useRef } from "react";
import {default as Vis } from "./ValueMatrix";

function ColumnInspector({tables, focusIndex}) {
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
            const data = tables
                .filter(table => table.isSelected)
                .map(table => 
                    Object.entries(table.columns[focusIndex].values)
                        .filter(([value, _]) => value !== "NA")
                        .map(([value, count]) => ({
                            key: `${table.id}-${value}`,
                            y: value,
                            x: table.name,
                            count
                        }))
                )
                .flat();
            visRef.current.update(data);
        } else {
            visRef.current.update([]);
        }
    }), [tables, focusIndex];

    return (<svg ref={svgRef}></svg>);

}

export default ColumnInspector;
