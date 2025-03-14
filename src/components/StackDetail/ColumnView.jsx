
/** 
 * ColumnView.jsx 
 * 
 * Notes:
 *  - I had technical trouble trigger focus on input elements from the rename option in
 *    the context menu. Follow the useEffect-approach listed on [Stack Overflow](https://stackoverflow.com/a/79315636/3734991)
 *    was able to make the UI perform the desired behavior.
 */

import { useEffect, useState, useRef } from "react";
import { Popover, List, ListItemButton } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { COLUMN_STATUS_NULLED, COLUMN_STATUS_REMOVED } from "../../lib/types/Column";
import { setColumnProperty } from "../../data/tableTreeSlice";
import { setHoverColumn, setHoverTable } from "../../data/uiSlice";

const DEBOUNCE_DELAY = 500;

export default function ColumnView({ column }) {
    const {id, name, status, index, tableId} = column;

    const dispatch = useDispatch();
    const {hoverColumn, hoverColumnIndex} = useSelector(({ui}) => ui);

    // Keep hover persistent when context menu opens
    const [isHovering, setIsHovering] = useState(false);
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
            () => dispatch(setHoverColumn(null)),
            // () => setIsHovering(false),
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
    const [value, setValue] = useState(name);
    useEffect(() => {
        const timeoutId = setTimeout(
            () => dispatch(setColumnProperty({
                column,
                property: "name",
                value
            })),
            DEBOUNCE_DELAY
        );
        return () => clearTimeout(timeoutId);
    }, [value, DEBOUNCE_DELAY])

    // Set class-based state styles
    const state = [
        (status === COLUMN_STATUS_NULLED) ? "null" : undefined,
        (hoverColumnIndex === index || hoverColumn === id )
            ? "hover" 
            : undefined
    ].filter(className => className).join(" ");

    // Render ColumnView
    return (
        <div 
            className={`ColumnView ${state}`}
        >
            <div 
                className="screen"
                onContextMenu={(event) => {
                    event.preventDefault();
                    setAnchorEl(event.target);
                }}
                onMouseEnter={() => {
                    // setIsHovering(true);
                    dispatch(setHoverColumn(id));
                    if (hoverTimeoutRef.current) {
                        clearTimeout(hoverTimeoutRef.current);
                        hoverTimeoutRef.current = null;
                    }
                }}
                onMouseLeave={() => {
                    // Only set the timeout if we're not opening a context menu
                    if (!isPopoverOpen) {
                        dispatch(setHoverColumn(null));
                        // hoverTimeoutRef.current = setTimeout(
                        //     () => dispatch(setHoverColumn(null)),
                        //     // () => setIsHovering(false), 
                        //     0  // Small delay to avoid flickering
                        // );
                    }
                    // dispatch(setHoverTable(null))
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
                        closePopover();
                    }}>
                        Remove
                    </ListItemButton>
                    <ListItemButton onClick={() => {
                        dispatch(setColumnProperty({
                            column,
                            property: "status",            
                            value: COLUMN_STATUS_NULLED
                        }));
                        closePopover();
                    }}>
                        Null
                    </ListItemButton>                    
                    <ListItemButton onClick={() => {
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