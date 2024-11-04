"use client"

import * as d3 from "d3";
import {useEffect, useState} from 'react';

const rowLimit = 10;

export default function({heading, tables, focusedIndex}) {
    const [rows, setRows] = useState([]);

    useEffect(() => {
        // Return empty table if tables are empty or 
        // if no table columns are selected
        if (tables.length === 0 || tables.filter(t => t.isSelected).length < 1) {
            // tables state is empty
            setRows(new Array());
            return;
        }

        // Initial column indices in the composite table to their original index in the data
        const indices = new Set(tables.map(t => t.columns)
            .flat()
            .filter(c => c.isSelected)
            .map(c => c.init.index));

        /**
         * subsetData
         * Remove unselected columns from data
         * @param {} rows 
         * @returns 
         */
        function subsetData(rows, tableIndices) {
            const out = rows
                .map(row => row
                    .map((val, i) => indices.has(i) 
                        ? tableIndices.has(i) ? val : null 
                        : undefined)
                    .filter((val, i) => val !== undefined));
            
            return out;
        }

        /**
         * arrangeColumns
         *  Re-arrange data by mapping original column indices to current column indices
         * @param {Array} rows 
         * @param {*} columns 
         * @returns Array
         */
        function arrangeColumns(rows, indexMap) {
            return Array.from(
                { length: rows.length }, 
                (_, i) => Array.from(
                    { length: indexMap.size }, 
                    (_, j) => rows[i][indexMap.get(j)]));
        }

        const tablePromises = tables
            .filter(t => t.isSelected)
            .map(t => fetch(t.path)
                .then(res => res.text())
                .then(text => d3.csvParseRows(text))
                .then(rows => [...rows.slice(0, rowLimit)])
                .then(rows => subsetData(
                    rows,
                    new Set(t.columns.filter(c => c.isSelected).map(c => c.init.index))
                ))
                // Re-arrange columns in ascending order
                .then(rows => {
                    const indexMap = new Map(t.columns
                        .filter(c => c.isSelected)
                        .map(c => [c.init.index, c.index])
                    );
                    return Array.from(
                        { length: rows.length }, 
                        (_, i) => Array.from(
                            { length: indexMap.size }, 
                            (_, j) => rows[i][indexMap.get(j)]));
                })
            );

        Promise.all(tablePromises)
               .then(data => data.reduce((accu, curr) => accu.concat(curr.slice(1))))
               .then(rows => setRows(rows))
               .catch(error => console.error(error));

    }, [tables]);

    if (rows.length === 0) {
        return <table></table>
    }

    return (
        <>
            <h3>{heading}</h3>
            <table>
                <thead>
                    <tr>{rows[0].map((header, i) => <th key={i}>{i}</th>)}</tr>
                </thead>
                <tbody>
                    {rows.slice(1).map((row, i) => <tr key={i}>{row.map((val, j) => 
                        <td style={{background: (j === focusedIndex ? "tomato" : null)}} key={j}>{val}</td>)}</tr>)}
                </tbody>
            </table>
        </>
    );
}