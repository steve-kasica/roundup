/**
 * StackRow.jsx
 * 
 * 
 */
import { useEffect, useRef } from "react";
import * as d3 from "d3";

export const CELL_WIDTH = 50;  // in pixels (px)
const DRAGGING_CLASS = "dragging";
const HOVERED_CLASS = "hovered";

const dataStyle = {
    height: `${CELL_WIDTH}px`,
    width: `${CELL_WIDTH}px`,
    lineHeight: `${CELL_WIDTH}px`
}

export default function StackRow({
    table,
    focusIndex, 
    onCellSwap
}) {
    const trRef = useRef();

    useEffect(() => {
        const tr = d3.select(trRef.current);
        // TODO: can this scope be at the module level?
        const drag = d3.drag()
            .on("start", onStartHandler)
            .on("drag", onDragHandler)
            .on("end", onEndHandler);
        
        tr.selectAll(".column")
            .datum(function() { return this.dataset; })
            .call(drag);

    }, [table]);

    return (
        <div 
            ref={trRef}        
            className="row" 
            style={{
                height: `${CELL_WIDTH}px`
            }}
        >        
            {table.columns.map((column, i) => (
            <div 
                key={column !== null ? column.id : `null-${i}`}
                className={`data column`}                
                data-index={i}
                data-id={column !== null ? column.id : ""}
                style={{
                    ...dataStyle, 
                    left: `${CELL_WIDTH * i}px`,
                }}
            >
                {column !== null ? column.name : ""}
            </div>
            ))}
        </div>
    )

    function onStartHandler() {
        const parent = this.parentElement.getBoundingClientRect();
        const child = this.getBoundingClientRect();
        d3.select(this)
            .classed(DRAGGING_CLASS, true)
            .attr("data-max", parent.right - child.right);
    }

    function onDragHandler({dx}) {
        const that = this;
        const dragging = d3.select(this);
        const row = d3.select(that.parentElement);
    
        // Update dragging position
        dragging.style("left", updatePosition(
            parseInt(dragging.style("left").replace("px", "")),
            dx,
            0,
            parseInt(dragging.attr("data-max")),
        ));
    
        // Update other cell styles, if overlapping
        row.selectAll("div.column")
            .classed(HOVERED_CLASS, function() { 
                const overlap = getPercentOverlap(this, that);
                console.log(overlap);
                return overlap > 0.5;
            });
    }

    function onEndHandler(event, d) {
        const dragging = d3.select(this);
        const tr = d3.select(this.parentElement);
        const getIndexOfChild = (parent, child) => Array.prototype.indexOf.call(parent.children, child);

        // const overlapSelector = "td.bg-slate-700"; // TODO: change to be more semantic
        // const overlap = tr.select(overlapSelector);
        // if (!overlap.empty()) {
        //     // onCellSwap([this, overlap.node()].map(child => ({
        //     //     i: getIndexOfChild(tr.node().parentNode, tr.node()),
        //     //     j: getIndexOfChild(tr.node(), child)
        //     // })));
        //     console.log("swap", td, tr);
        // }

        // Reset temporary styles
        dragging
            .classed(DRAGGING_CLASS, false);
        // tr.selectAll(``)
        //     .classed(HOVERED_CLASS + " " + DRAGGING_CLASS, false)
        //     .style("left", null)
        //     .attr("data-min", null)
        //     .attr("data-max", null)
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

/**
 * getPercentOverlap
 * 
 * Get the percentage of overlap between two element along the x-axis, left to right.
 * 
 * @param {DOM} a 
 * @param {DOM} b 
 * 
 * Note that `right` and `left` are relative from the viewport, see [`getBoundingClientRect`](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect)
 */
function getPercentOverlap(a, b) {
    const { right: aRight,  left: aLeft, width } = a.getBoundingClientRect();
    const { right: bRight, left: bLeft } = b.getBoundingClientRect();
    const overlap = 1 - (Math.abs(aRight - bRight) / width);
    return Math.max(0, overlap);
}