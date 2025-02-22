/**
 * StackCell.jsx
 * 
 * 
 */
import { useEffect, useRef, useState } from "react"
import { useDispatch } from "react-redux";
import { setColumnProperty } from "../../data/tableTreeSlice";
import { List, ListItemButton, Popover } from "@mui/material";
import { COLUMN_STATUS_NULLED, COLUMN_STATUS_REMOVED } from "../../lib/types/Column";
import { setFocusedColumnIndex } from "../../data/uiSlice";

function cn() {
    return Array.prototype.slice.call(arguments).filter(arg => arg).join(" ");
}

export default function StackCell({column}) {
    const {name, id, status} = column;
    const dispatch = useDispatch();
    const [anchorEl, setAnchorEl] = useState(null);
    const isPopoverOpen = Boolean(anchorEl);
    const closePopover = () => setAnchorEl(null);

    const [isEditable, setIsEditable] = useState(false);
    const inputRef = useRef(null);
    useEffect(() => {
        if (!isEditable) return;
        inputRef.current?.focus();
    }, [isEditable]);

    return (
        <div
            className={cn(
                "StackCell",
                status === COLUMN_STATUS_NULLED ? "null" : undefined
            )}
            onContextMenu={handleOnContextMenu}
        >
            <div className="screen">
                <input 
                    ref={inputRef}
                    type="text"
                    id={`cell-${id}`}
                    disabled={!isEditable}
                    value={status === COLUMN_STATUS_NULLED ? "null" : name}
                    onChange={handleOnChange}
                    onClick={handleInputOnClick}
                    onBlur={handleOnBlur}
                    onFocus={handleInputFocus}
                    minLength={1}
                    // data-index={i}
                    // data-table-id={table.id}
                    // data-column-id={column !== null ? column.id : ""}
                />
                <Popover
                    open={isPopoverOpen}
                    anchorEl={anchorEl}
                    onClose={handlePopoverOnClose}
                    anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "left"
                    }}
                >
                    <List>
                        <ListItemButton onClick={handleRemoveClick}>Remove</ListItemButton>
                        <ListItemButton onClick={handleNullClick}>Null</ListItemButton>                    
                        <ListItemButton onClick={handleRenameClick}>Rename</ListItemButton>                    
                    </List>
                </Popover>
            </div>
        </div>
    );

    // ## Event handlers
    // ----------------------------------------------------------

    function handleOnContextMenu(event) {
        event.preventDefault();
        setAnchorEl(event.target);
    }

    function handleInputOnClick(event) {
        event.preventDefault();
    }

    function handleInputFocus(event) {
        // TODO: highlight current value instead of place cursor
        // at the end of text input
        event.preventDefault();
    }

    function handleOnBlur(event) {
        setIsEditable(false);
        dispatch(setFocusedColumnIndex(null));
    }

    function handleRemoveClick(event) {
        dispatch(setColumnProperty({
            column,
            property: "status",
            value: COLUMN_STATUS_REMOVED
        }));
        closePopover();
    }

    function handleNullClick(event) {
        dispatch(setColumnProperty({
            column,
            property: "status",            
            value: COLUMN_STATUS_NULLED
        }));
        closePopover();
    }

    function handleRenameClick(event) {
        setIsEditable(true);
        closePopover();
    }

    function handlePopoverOnClose(event) {
        closePopover();
        dispatch(setFocusedColumnIndex(null));
    }

    function handleOnChange(event) {
        dispatch(setColumnProperty({
            column,
            property: "name",
            value: event.target.value
        }));
    }
}