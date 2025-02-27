/** 
 * ColumnView/Layouts/CellLayout.jsx 
 * 
 * Notes:
 *  - I had technical trouble trigger focus on input elements from the rename option in
 *    the context menu. Follow the useEffect-approach listed on [Stack Overflow](https://stackoverflow.com/a/79315636/3734991)
 *    was able to make the UI perform the desired behavior.
 */

import { useEffect, useState, useRef } from "react";
import { Popover, List, ListItemButton } from "@mui/material";

const DEBOUNCE_DELAY = 500;

export default function CellLayout({ 
    initialValue,
    removeColumn,
    nullColumn,
    renameColumn
}) {
    const [isFocused, setIsFocused] = useState(false);
    const [value, setValue] = useState(initialValue);

    const [anchorEl, setAnchorEl] = useState(null);
    const isPopoverOpen = Boolean(anchorEl);
    const closePopover = () => setAnchorEl(null);

    const inputRef = useRef(null);    
    useEffect(() => {
        if (!isFocused) return;
       inputRef.current?.focus();
    }, [isFocused]);

    useEffect(() => {
        const timeoutId = setTimeout(() => renameColumn(value), DEBOUNCE_DELAY);
        return () => clearTimeout(timeoutId);
    }, [value, DEBOUNCE_DELAY])

    return (
        <>
            <div 
                className="screen"
                onContextMenu={(event) => {
                    event.preventDefault();
                    setAnchorEl(event.target);
                }}
                onDoubleClick={() => setIsFocused(true)}
            >
                <input 
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
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
                        removeColumn();
                        closePopover();
                    }}>
                        Remove
                    </ListItemButton>
                    <ListItemButton onClick={() => {
                        nullColumn();
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
    </>
    );
}