
import { useEffect, useRef, Fragment } from "react";
import * as d3 from "d3";

export default function StackRow({columns, onCellSwap}) {
    const trRef = useRef();

    useEffect(() => {
        const tr = d3.select(trRef.current);
        const drag = d3.drag()
            .on("start", onStartHandler)
            .on("drag", onDragHandler)
            .on("end", onEndHandler);
        
        tr.selectAll("td")
            .datum(function() { return this.dataset; })
            .call(drag);

    }, [columns]);

    return (
        <Fragment key={columns[0].table.id}>
        <tr 
            ref={trRef} 
            key={columns[0].table.id}>
            {columns.map((column, i) => (
                <td key={column.id}
                    data-index={i}
                    className={`border rounded p-2 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 cursor-ew-resize ${(column.isSelected) ? "border-solid " : "border-dotted"}`}
                >
                    <p className="truncate text-center text-sm select-none">
                        {column.isSelected ? column.name : ""}
                    </p>
                </td>
            ))}
        </tr>
    </Fragment>
    )

    function onStartHandler() {
        const parent = this.parentElement.getBoundingClientRect();
        const child = this.getBoundingClientRect();
        const td = d3.select(this);
        td.style("position", "relative")
          .style("left", 0)
          .attr("data-min", (child.left - parent.left) * -1)
          .attr("data-max", parent.right - child.right);
    }

    function onDragHandler({dx}) {
        const that = this;
        const td = d3.select(that);
        const tr = d3.select(that.parentElement);
    
        // Set active <td> position
        td.style("left", updatePosition(
            parseInt(td.style("left").replace("px", "")),
            dx,
            parseInt(td.attr("data-min")),
            parseInt(td.attr("data-max")),
        ));
    
        // Update other cell styles, if overlapping
        tr.selectAll("td")
            .classed("bg-slate-700", function() { 
                return (boundsOverlap(this, that) && that !== this)
            });
    }

    function onEndHandler(event, d) {
        const td = d3.select(this);
        const tr = d3.select(this.parentElement);

        const overlap = tr.select("td.bg-slate-700");
        if (!overlap.empty()) {
            onCellSwap(
                columns[d.index], 
                columns[overlap.datum().index]
            );
        }

        // Reset temporary styles
        tr.selectAll("td")
            .style("position", null)
            .style("left", null)
            .attr("data-min", null)
            .attr("data-max", null)
            .classed("bg-slate-700", false);
    }

}

function updatePosition(prev, offset, min, max) {
    let curr = prev + offset;
    if (curr < min) {
        curr = min;
    } else if (curr > max) {
        curr = max;
    }
    return `${curr}px`;
}

function boundsOverlap(a, b) {
    const aPos = a.getBoundingClientRect();
    const bPos = b.getBoundingClientRect();
    return (aPos.right >= bPos.left && aPos.left <= bPos.right);
}