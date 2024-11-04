"use client"

import {useRef, useEffect} from 'react';
import Vis from "./TableStack.js";
import "./TableStack.css"
import * as d3 from "d3";

export default function TableStack({heading, tables, setTables, focusedIndex}) {

    const svgRef = useRef(null);
    const visRef = useRef(null);

    function onChangeHandler(source, target) {
        setTables(state => {
            state
                .filter(t => t.name === source.y)
                [0].columns
                .forEach(c => { 
                    if (c.key === source.key) {
                        c.index = source.x;
                    } else if (c.key === target.key) {
                        c.index = target.x;
                    }
                });
            return [...state];
        });
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
        } else if (tables.filter(t => t.isSelected).length > 0) {
            const selectedColumns = tables
                .map(t => t.columns)
                .flat()
                .filter(c => c.isSelected);
            
            const indexLookup = new Map(selectedColumns
                .map(c => c.index)
                .sort(d3.ascending)
                .map((index, position) => [index, position])
            );

            const data = selectedColumns
                .map(c => ({
                    x: indexLookup.get(c.index),
                    y: c.table.name,
                    key: c.key,
                    isFocused: c.index === focusedIndex,
                    isNull: false,
                    text: c.name,
                }));

            visRef.current.update(data);
        } else {
            visRef.current.update([]);
        }
    }, [tables, focusedIndex]);

    return (
        <>
            <h3>{heading}</h3>
            <svg 
                className="table-stack"
                ref={svgRef}
            />
        </>
    )
}
