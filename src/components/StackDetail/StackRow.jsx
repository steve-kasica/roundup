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
        
        tr.selectAll("td")
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
        const td = d3.select(this);
        td
            .classed(DRAGGING_CLASS, true)
            .attr("data-original-position", "x")
            .attr("data-min", (child.left - parent.left) * -1)
            .attr("data-max", parent.right - child.right)
            .style("left", 0);
    }

    function onDragHandler({dx}) {
        const that = this;
        const td = d3.select(that);
        const tr = d3.select(that.parentElement);
    
        // Update dragging <td> position
        td.style("left", updatePosition(
            parseInt(td.style("left").replace("px", "")),
            dx,
            parseInt(td.attr("data-min")),
            parseInt(td.attr("data-max")),
        ));
    
        // Update other cell styles, if overlapping
        tr.selectAll("td")
            .classed(HOVERED_CLASS, function() { 
                const {a: thisOverlap, b: thatOverlap} = getPercentOverlap(this, that);
                // console.log(thisOverlap);
                return thisOverlap === 1 || thatOverlap === 1;
                return (boundsOverlap(this, that) && that !== this)
            });
    }

    function onEndHandler(event, d) {
        const td = d3.select(this);
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
        tr.selectAll("td")
            .classed(HOVERED_CLASS + " " + DRAGGING_CLASS, false)
            .style("left", null)
            .attr("data-min", null)
            .attr("data-max", null)
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
    const { right: aRight, left: aLeft, width: aWidth } = a.getBoundingClientRect();
    const { right: bRight, left: bLeft, width: bWidth } = b.getBoundingClientRect();
    const overlap = (aRight < bLeft || aLeft > bRight) ? 0 : aRight - bLeft;
    return ({ a: overlap / aWidth, b: overlap / bWidth });
}