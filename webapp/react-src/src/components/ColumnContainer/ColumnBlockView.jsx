
/** 
 * ColumnView.jsx 
 * 
 * A view for Column instance data within the StackDetail component
 * 
 * Notes:
 *  - *autofocus*: I had technical trouble trigger focus on input elements from the rename option in
 *    the context menu. Follow the useEffect-approach listed on [Stack Overflow](https://stackoverflow.com/a/79315636/3734991)
 *    was able to make the UI perform the desired behavior.
 * 
 */

import { useEffect, useState, useRef } from "react";
import { Popover, List, ListItemButton } from "@mui/material";
import { renameColumnRequest } from "../../data/slices/sourceColumnsSlice";
import { drag, select, selectAll } from "d3";
import { hoverColumnIndexInTable, unfocusColumn, unhoverColumnIndexInTable } from "../../data/uiSlice";

export const LAYOUT_ID = "block";

function swapColumnPositions() {
    // TODO
}

function removeColumnsAfter() {
    // TODO
}

function setColumnProperty() {
    // TODO
}

const DEBOUNCE_DELAY = 500;  // in ms
const OVERLAP_THRESHOLD = 0.5; // percent

// export default function({ tableId, columnId, position, tableName, columnCount }) {
export default function ColumnBlockView({
    id,
    tableId,
    name,
    index,
    columnType,
    isLoading,
    isSelected,
    isNull,
    isHovered,
    isFocused,
    handleRemoveColumn,
    handleColumnHover,
    handleColumnUnhover,
    handleColumnFocus,
    handleRemoveColumnsAfter
}) {
    // const isLastInTable = (position === columnCount);
    const isLastInTable = false; // TODO: implement logic

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

    // Setup context menu
    //
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
            () => handleColumnHover(),
            265
        );
    };

    // // Weird workaround to trigger focus on column from context menu clicks
    const inputRef = useRef(null);    
    // const [isFocused, setIsFocused] = useState(false);
    useEffect(() => {
        if (!isFocused) return;
       inputRef.current?.focus();
    }, [isFocused]);

    // Debounce input when modifying column attributes in the DOM
    const [value, setValue] = useState(name);
    useEffect(() => {
        const timeoutId = setTimeout(
            () => dispatch(renameColumnRequest({
                projectId: tableId,
                columnIndex: index,
                newColumnName: value,
                oldColumnName: name,
            })),
            DEBOUNCE_DELAY
        );
        return () => clearTimeout(timeoutId);
    }, [value, DEBOUNCE_DELAY])

    // Render ColumnView
    return (
        <div
            // ref={columnDataRef} 
            data-table-id={tableId}
            data-column-index={position - 1}
        >
            <div 
                className="screen"
                onContextMenu={(event) => {
                    event.preventDefault();
                    setAnchorEl(event.target);
                }}
                onMouseEnter={() => {
                    handleColumnHover();
                    if (hoverTimeoutRef.current) {
                        clearTimeout(hoverTimeoutRef.current);
                        hoverTimeoutRef.current = null;
                    }
                }}
                onMouseLeave={() => {
                    if (!isPopoverOpen) {
                        handleColumnUnhover();
                    }
                }}
                onDoubleClick={handleColumnFocus}
            >
                <input 
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={event => setValue(event.target.value)}
                    onBlur={handleColumnUnfocus()}
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
                        handleRemoveColumn();
                        // dispatch(setColumnHover({
                        //     tableId: column.tableId,
                        //     columnId: column.id,
                        //     isHovered: true
                        // }));
                        closePopover();
                    }}>
                        Remove column {name}
                    </ListItemButton>
                    <ListItemButton 
                        disabled={isLastInTable}
                        onClick={() => {
                            handleRemoveColumnsAfter();
                            closePopover();
                        }}>
                        Remove all to the right
                    </ListItemButton>
                    <hr></hr>
                    <ListItemButton 
                        disabled={isNull}
                        onClick={() => {
                            // TODO update
                            // dispatch(setColumnProperty({
                            //     column,
                            //     property: "status",
                            //     value: COLUMN_STATUS_NULLED
                            // }));
                            setValue("null");
                            closePopover();
                        }}>
                        Null column {position} in {tableName}
                    </ListItemButton>                    
                    <ListItemButton 
                        // TODO: can't rename null columns
                        // disabled={status === COLUMN_STATUS_NULLED}
                        onClick={() => {
                            handleColumnFocus();
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