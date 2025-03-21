
/** 
 * ColumnView.jsx 
 * 
 * Notes:
 *  - *autofocus*: I had technical trouble trigger focus on input elements from the rename option in
 *    the context menu. Follow the useEffect-approach listed on [Stack Overflow](https://stackoverflow.com/a/79315636/3734991)
 *    was able to make the UI perform the desired behavior.
 * 
 */

import { useEffect, useState, useRef } from "react";
import { Popover, List, ListItemButton } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { COLUMN_STATUS_NULLED, COLUMN_STATUS_REMOVED } from "../../../lib/types/Column";
import { removeColumnsAfter, setColumnProperty } from "../../../data/tableTreeSlice";
import { drag, select, selectAll } from "d3";
import { swapColumnPositions } from "../../../data/tableTreeSlice";

// const DEBOUNCE_DELAY = 500;
const OVERLAP_THRESHOLD = 0.5; // percent

export default function({ column, position, tableName, columnCount }) {
    const { name, status, tableId, isSelected, isHovered} = column;
    const isLastInTable = (position === columnCount);

    const dispatch = useDispatch();
    const {hoverColumnIndex, hoverTable} = useSelector(({ui}) => ui);

    const columnDataRef = useRef();
    useEffect(() => {
        select(columnDataRef.current)
            .call(drag()
            .on("start", function() {
                const {top, left} = this.getBoundingClientRect();
                const originalElement = select(this);
                const clone = originalElement.clone(true);
                clone.classed("ghost", true);

                originalElement
                    .classed("drag", true)
                    .style("position", "fixed")
                    .style("top", `${top}px`)
                    .style("left", `${left}px`);
            })
            .on("drag", function({dx}) {
                const that = this;
                const dragging = select(that);
                const left = parseInt(dragging.style("left").replace("px"));
                dragging.style("left", `${left + dx}px`);

                selectAll(`.ColumnView[data-table-id="${tableId}"]`)
                    .filter(function() { return (this !== that); })
                    .classed("hovered", function() {
                        return getPercentOverlap(this, dragging.node()) > OVERLAP_THRESHOLD;
                    })
            })
            .on("end", function() {
                const source = select(this);
                const target = select(".ColumnView.hovered");

                // reset all dragging styles
                source
                    .classed("drag", false)
                    .style("position", null)
                    .style("top", null)
                    .style("left", null);             
                selectAll(".ColumnView.ghost")
                    .remove();
                selectAll(".ColumnView.hovered")
                    .classed("hovered", false);

                // Update data state
                if (target.node()) {
                    dispatch(swapColumnPositions({
                        tableId: source.attr("data-table-id"),
                        sourceIndex: parseInt(source.attr("data-column-index")),
                        targetIndex: parseInt(target.attr("data-column-index")),
                    }));
                } else {
                    // Treat as if a regular click, equivalent to callback for onMouseUp
                    dispatch(setColumnProperty({
                        column,
                        property: "isSelected",
                        value: !isSelected
                    }));
                }
            })
        );
    }, []);

    // Keep hover persistent when context menu opens
    const hoverTimeoutRef = useRef(null);

    // Local state variables and functions for displaying context menu
    const [anchorEl, setAnchorEl] = useState(null);
    const isPopoverOpen = Boolean(anchorEl);
    const closePopover = () => {
        setAnchorEl(null);
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
        }
        // Determine if we should still be hovering based on mouse position
        // This could be improved with a check if mouse is still over element
        hoverTimeoutRef.current = setTimeout(
            () => dispatch(setColumnProperty({
                column,
                property: "isHovered",
                value: true
            })),
            265
        );
    };

    // Weird workaround to trigger focus on column from context menu clicks
    const inputRef = useRef(null);    
    const [isFocused, setIsFocused] = useState(false);
    useEffect(() => {
        if (!isFocused) return;
       inputRef.current?.focus();
    }, [isFocused]);

    // Debounce input when modifying column attributes in the DOM
    const [value, setValue] = useState(status !== COLUMN_STATUS_NULLED ? name : "null");
    // useEffect(() => {
    //     const timeoutId = setTimeout(
    //         () => dispatch(setColumnProperty({
    //             column,
    //             property: "name",
    //             value
    //         })),
    //         DEBOUNCE_DELAY
    //     );
    //     return () => clearTimeout(timeoutId);
    // }, [value, DEBOUNCE_DELAY])

    // Set class-based state styles
    const state = [
        (status === COLUMN_STATUS_NULLED) ? "null" : undefined,
        (isHovered) ? "hovered" : undefined,
        (isSelected) ? "selected" : undefined
    ].filter(className => className).join(" ");

    // Render ColumnView
    return (
        <div
            ref={columnDataRef} 
            data-table-id={tableId}
            data-column-index={position - 1}
            className={`ColumnView ${state}`}
        >
            <div 
                className="screen"
                onContextMenu={(event) => {
                    event.preventDefault();
                    setAnchorEl(event.target);
                }}
                onMouseEnter={() => {
                    dispatch(setColumnProperty({
                        column,
                        property: "isHovered",
                        value: true
                    }));
                    if (hoverTimeoutRef.current) {
                        clearTimeout(hoverTimeoutRef.current);
                        hoverTimeoutRef.current = null;
                    }
                }}
                onMouseLeave={() => {
                    if (!isPopoverOpen) {
                        dispatch(setColumnProperty({
                            column,
                            property: "isHovered",
                            value: false
                        }));
                    }
                }}
                onDoubleClick={() => setIsFocused(true)}
            >
                <input 
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={event => setValue(event.target.value)}
                    onBlur={() => setIsFocused(false)}
                    minLength={1}
                />
            </div>
            <Popover
                open={isPopoverOpen}
                anchorEl={anchorEl}
                onClose={closePopover}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "left"
                }}
            >
                <List>
                    <ListItemButton onClick={() => {
                        dispatch(setColumnProperty({
                            column,
                            property: "status",
                            value: COLUMN_STATUS_REMOVED
                        }));
                        dispatch(setColumnProperty({
                            column,
                            property: "isHovered",
                            value: false
                        }));
                        closePopover();
                    }}>
                        Remove {column.name}
                    </ListItemButton>
                    <ListItemButton 
                        disabled={isLastInTable}
                        onClick={() => {
                            dispatch(removeColumnsAfter(column));
                            closePopover();
                        }}>
                        Remove all to the right
                    </ListItemButton>
                    <hr></hr>
                    <ListItemButton 
                        disabled={status === COLUMN_STATUS_NULLED}
                        onClick={() => {
                            dispatch(setColumnProperty({
                                column,
                                property: "status",            
                                value: COLUMN_STATUS_NULLED
                            }));
                            setValue("null");
                            closePopover();
                        }}>
                        Null column {position} in {tableName}
                    </ListItemButton>                    
                    <ListItemButton 
                        disabled={status === COLUMN_STATUS_NULLED}
                        onClick={() => {
                            setIsFocused(true);
                            closePopover();
                        }}>
                        Rename
                    </ListItemButton>                    
                </List>
            </Popover>
    </div>
    );
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