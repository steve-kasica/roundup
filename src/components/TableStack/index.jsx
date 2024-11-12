"use client"

import * as d3 from "d3";
import StackBody from "./StackBody";
import StackHeader from "./StackHeader";

export default function TableStack({tables, transforms, onCellSwap, focusIndex}) {

    const selectedIndices = new Set(tables
        .map(table => table.selectedColumns.map(column => column.index))
        .flat()
    );

    const bodyData = tables
            .filter(table => table.isSelected)
            .map(table => table.columns
                .filter(c => selectedIndices.has(c.index))
                .sort((a,b) => d3.ascending(a.index, b.index))
            );

    const headerData = Array.from(
        d3.group(
            bodyData.flat(), 
            c => c.index,
            c => c.name
        ), 
        ([i, names]) => [...names.keys()].filter(text => text.length > 0)
    );

    return (
        <table className="w-full table-fixed border-separate border-spacing-2 border border-slate-400">
            <thead>
                <StackHeader data={headerData} />
            </thead>
            <StackBody 
                data={bodyData}
                onCellSwap={onCellSwap}
            />
        </table>
    )
}