/**
 * StackRow.jsx
 * 
 * 
 */
import { useEffect, useRef } from "react";
import * as d3 from "d3";

export default function StackRow({
    table,
    focusIndex, 
    onCellSwap
}) {
    const trRef = useRef();

    // useEffect(() => {
    //     const tr = d3.select(trRef.current);
    //     // TODO: can this scope be at the module level?
    //     const drag = d3.drag()
    //         .on("start", onStartHandler)
    //         .on("drag", onDragHandler)
    //         .on("end", onEndHandler);
        
    //     tr.selectAll("td")
    //         .datum(function() { return this.dataset; })
    //         .call(drag);

    // }, [table.columns]);

    const setTdClassName = (isNull, isFocused) => {
        let className = "border rounded p-2 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 cursor-ew-resize";
        className += (isNull) ? "border-solid " : "border-dotted ";
        className += (isFocused) ? "bg-sky-500/50 " : "";
        return className;
    };

    return (
        <tr ref={trRef}>
            <td className="label">{table.name}</td>
            {table.columns.map((column, i) => (
                <td key={column !== null ? column.id : `null-${i}`}
                    data-index={i}
                    data-id={column !== null ? column.id : ""}
                    className={`column`}
                    // className={setTdClassName(column === null, i === focusIndex)}
                >
                    {column !== null ? column.name : ""}
                </td>
            ))}
        </tr>
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
        const getIndexOfChild = (parent, child) => Array.prototype.indexOf.call(parent.children, child);

        const overlapSelector = "td.bg-slate-700"; // TODO: change to be more semantic
        const overlap = tr.select(overlapSelector);
        if (!overlap.empty()) {
            onCellSwap([this, overlap.node()].map(child => ({
                i: getIndexOfChild(tr.node().parentNode, tr.node()),
                j: getIndexOfChild(tr.node(), child)
            })));
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