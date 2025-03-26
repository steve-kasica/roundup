/**
 * StackRow.jsx
 * 
 * 
 */
import { Fragment, useEffect, useRef, useState } from "react";
import * as d3 from "d3";

import {Input, Menu, MenuItem} from "@mui/material"
import { useDispatch } from "react-redux";
import { COLUMN_STATUS_NULLED, COLUMN_STATUS_REMOVED } from "../../../lib/types/Column";
import { setColumnProperty } from "../../../data/tableTreeSlice";
import StackCell from "./StackCell";

export const CELL_WIDTH = 50;  // pixels (px)
export const OVERLAP_THRESHOLD = 0.5; // percent

// text string to represent null column indexes within a table
const NULL_TEXT = "";

const DRAGGING_CLASS = "dragging";
const HOVERED_CLASS = "hovered";

const dataStyle = {
    // height: `${CELL_WIDTH}px`,
    // width: `${CELL_WIDTH}px`,
    lineHeight: `${CELL_WIDTH}px`
}

export default function StackRow({
    table,
    focusIndex, 
    onCellSwap
}) {
    const [focusedCell, setFocusedCell] = useState(null);
    const [contextMenu, setContextMenu] = useState(null);
    const [editableCell, setEditableCell] = useState(null);
    // const [selectedColumn, setSelectedColumn] = useState(null);
    const dispatch = useDispatch();
    const trRef = useRef();

    // useEffect(() => {
    //     const tr = d3.select(trRef.current);
    //     // TODO: can this scope be at the module level?
    //     const drag = d3.drag()
    //         .on("start", onStartHandler)
    //         .on("drag", onDragHandler)
    //         .on("end", onEndHandler);
        
    //     tr.selectAll(".column:not(.null)")
    //         .datum(function() { return this.dataset; })
    //         .call(drag);

    // }, [table]);

    // useEffect(() => {
    //     if (!focusedCell) return;
    //     const cell = d3.select(`.column[data-column-id=${focusedCell}]`);
    //     cell.attr("contentEditable", "plaintext-only");
    //     setTimeout(function() {cell.dispatch("focus")}, 0);
    // }, [focusedCell]);

    const handleContextMenu = (event) => {
        event.preventDefault();
        const columnData = event.target.parentElement.dataset;
        setContextMenu(
          contextMenu === null
            ? {
                ...columnData,
                mouseX: event.clientX + 2,
                mouseY: event.clientY - 6,
              }
            : // repeated contextmenu when it is already open closes it with Chrome 84 on Ubuntu
              // Other native context menus might behave different.
              // With this behavior we prevent contextmenu from the backdrop to re-locale existing context menus.
              null,
        );
    };

    return (
        <div 
            ref={trRef}        
            className="row" 
            style={{
                height: `${CELL_WIDTH}px`
            }}
        >        
            {table.columns
                .filter(column => column.status !== COLUMN_STATUS_REMOVED)
                .map((column, i) => (
                    <StackCell
                        key={column !== null ? column.id : `null-${i}`}
                        column={column}
                        index={i}
                    ></StackCell>
                ))}
                <Menu
                    open={contextMenu !== null}
                    onClose={() => setContextMenu(null)}
                    anchorReference="anchorPosition"
                    anchorPosition={
                        contextMenu !== null
                            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                            : undefined
                    }
                >
                    <MenuItem onClick={onRemoveClick}>Remove</MenuItem>
                    <MenuItem onClick={onNullClick}>Null</MenuItem>
                    <MenuItem onClick={onRenameClick}>Rename</MenuItem>
                    {/* <MenuItem onClick={onMoveClick}>Move</MenuItem> */}
                    {/* {
                        (selectedColumn !== null) ? (
                            <MenuItem onClick={onSwapClick}>Swap with selected column</MenuItem>
                        ) : (
                            null
                        )
                    } */}
                </Menu>
            </div>
    ); // end return

    function onRemoveClick() {
        dispatch(setColumnProperty({
            ...contextMenu, 
            property: "status",
            value: COLUMN_STATUS_REMOVED
        }));
        setContextMenu(null);
    }

    function onNullClick() {
        dispatch(setColumnProperty({
            ...contextMenu, 
            property: "status",            
            value: COLUMN_STATUS_NULLED
        }));
        setContextMenu(null);        
    }


    function onRenameClick(event) {
        setFocusedCell(contextMenu.columnId);
        // setEditableCell(contextMenu.columnId);
        // const cell = d3.select(`#cell-${contextMenu.columnId}`);

        // cell.on("focus", () => cell
        //         .attr("contentEditable", "plaintext-only")
        //         .classed("editable", true)
        //     )
        //     .on("blur", () => cell
        //         .classed("editable", false)
        //         .attr("contentEditable", false)
        //         .on("focus", null)
        //         // .on("blur", null);
        //     );
        // cell.addEventListener("focus", () => d3.select(cell).classed("editable", true));

        // cell.focus();
        // cell.addEventListener("input", function() { 
        //     console.log(this, arguments);
        // });
        // const newName = "foo";
        // dispatch(updateColumnProperty({
        //     ...contextMenu,
        //     property: "name",
        //     value: newName
        // }));
        // cell.dispatch("focus");
        setContextMenu(null);
    }

    // function onMoveClick() {
    //     console.log(contextMenu);
    //     setContextMenu(null);
    // }

    // function onSwapClick() {
    //     console.log(contextMenu);
    //     setContextMenu(null);        
    // }

    function onStartHandler() {
        const parent = this.parentElement.getBoundingClientRect();
        const child = this.getBoundingClientRect();
        d3.select(this)
            .classed(DRAGGING_CLASS, true)
            .attr("data-max", parent.right - child.right)
            .attr("data-prev-left", d3.select(this).style("left"));
    }

    function onDragHandler({dx}) {
        const that = this;
        const dragging = d3.select(this);
        const row = d3.select(that.parentElement);
    
        // Update dragging position
        // dragging.style("left", function() {
        //     const position = updatePosition(
        //         parseInt(dragging.style("left").replace("px", "")),
        //         dx,
        //         0,
        //         parseInt(dragging.attr("data-max")),
        //     );
        //     return position;
        // });
    
        // Update other cell styles, if overlapping
        row.selectAll("div.column")
            .filter(function() {
                return (this !== that)
            })
            .classed(HOVERED_CLASS, function() { 
                return getPercentOverlap(this, that) > OVERLAP_THRESHOLD;
            })
            // .style("left", function() {
            //     if (getPercentOverlap(this, that) > OVERLAP_THRESHOLD) {
            //         return d3.select(that).attr("data-prev-left");
            //     } else {
            //         return d3.select(this).style("left");
            //     }
            // })
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