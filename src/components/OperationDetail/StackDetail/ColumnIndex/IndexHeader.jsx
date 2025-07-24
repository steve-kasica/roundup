import {
  Box,
  Chip,
  FormControl,
  IconButton,
  Input,
  InputAdornment,
  InputLabel,
  List,
  ListItemButton,
  OutlinedInput,
  Paper,
  Popover,
  Typography,
} from "@mui/material";
import { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch } from "react-redux";
// import { updateOperationColumnName } from "../../../../slices/operationsSlice"; // Add your action import
import ChevronDownIcon from "@mui/icons-material/ExpandMore";
import { isPointInBoundingBox } from "../../../../lib/utilities";

export default function IndexHeader({
  title,
  onInputChange,
  index = 0,
  onColumnClick,
}) {
  // Context menu
  const [inputValue, setInputValue] = useState(title || `Column ${index + 1}`);

  const [anchorEl, setAnchorEl] = useState(null);
  const isPopoverOpen = Boolean(anchorEl);
  const hoverTimeoutRef = useRef(null);

  const inputRef = useRef(null); // Needed to focus the input element from context menu
  const headerRef = useRef(null);

  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const isMenuOpen = Boolean(menuAnchorEl);
  const [isMenuIconVisable, setIsMenuIconVisible] = useState(false);

  const debounceRef = useRef(null);

  // Custom debounce function
  const debouncedDispatch = useCallback(
    (newName) => {
      // Clear existing timeout
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      // Set new timeout
      debounceRef.current = setTimeout(() => {
        onInputChange(newName);
      }, 300);
    },
    [index]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // const closePopover = () => {
  //   setAnchorEl(null);
  //   if (hoverTimeoutRef.current) {
  //     clearTimeout(hoverTimeoutRef.current);
  //   }
  //   // Determine if we should still be hovering based on mouse position
  //   // This could be improved with a check if mouse is still over element
  //   hoverTimeoutRef.current = setTimeout(unHoverColumn, 235);
  // };

  // Add useEffect to handle focus when isHeaderEditable changes
  // useEffect(() => {
  //   if (isHeaderEditable && inputRef.current) {
  //     // For MUI Input, we need to focus the actual input element
  //     const inputElement =
  //       inputRef.current.querySelector("input") || inputRef.current;
  //     inputElement.focus();
  //     inputElement.select();
  //   }
  // }, [isHeaderEditable]);

  const menuItems = [
    {
      label: "Rename column",
      action: () => {
        // Delay focus to allow menu to close first
        setTimeout(() => {
          inputRef.current?.focus();
          inputRef.current?.select();
        }, 100); // 50-100ms is usually enough
      },
    },
    {
      label: "Select columns at index",
      action: () => onColumnClick({ shiftKey: false }, index),
    },
    {
      label: "Select all columns to the right",
      action: () => onColumnClick({ shiftKey: false }, index, true),
    },
    // TODO
    // {
    //   label: "Compare unique values",
    //   // action: compareVectorValues,
    // },
  ];

  return (
    <>
      <Paper
        ref={headerRef}
        elevation={0}
        sx={{
          margin: "0.25rem",
        }}
        onMouseEnter={() => setIsMenuIconVisible(true)}
        onMouseLeave={() => setIsMenuIconVisible(false)}
      >
        <Input
          inputRef={inputRef}
          type="text"
          margin="dense"
          size="small"
          fullWidth
          value={inputValue}
          startAdornment={
            <InputAdornment position="start">
              <Typography
                sx={{
                  fontSize: "0.875rem",
                  color: "#aaa",
                }}
              >
                {index + 1}
              </Typography>
            </InputAdornment>
          }
          endAdornment={
            <InputAdornment position="end">
              <IconButton
                size="small"
                sx={{
                  position: "absolute",
                  right: 0,
                  opacity: isMenuIconVisable ? 1 : 0,
                  transition: "opacity 0.2s ease-in-out",
                }}
                onClick={(event) => setMenuAnchorEl(event.currentTarget)}
              >
                <ChevronDownIcon />
              </IconButton>
            </InputAdornment>
          }
          onChange={(event) => {
            setInputValue(event.target.value);
            debouncedDispatch(event.target.value);
          }}
          // onBlur={() => setIsHeaderEditable(false)}
          slotProps={{
            input: {
              sx: {
                color: "#555",
                fontSize: "0.875rem",
                fontWeight: "bold",
                cursor: "inherit",
                textAlign: "center",
                textOverflow: "ellipsis",
                overflow: "hidden",
                whiteSpace: "nowrap",
              },
            },
          }}
        />
      </Paper>
      <Popover
        open={isMenuOpen}
        anchorEl={menuAnchorEl}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        onClose={({ clientX, clientY }) => {
          // // use headerRef since currentTarget is the modal background
          // const bbox = headerRef.current.getBoundingClientRect();
          // const isMouseOverHeader = isPointInBoundingBox(
          //   { x: clientX, y: clientY },
          //   bbox
          // );
          // if (!isMouseOverHeader) {
          //   unhoverColumnVector();
          //   setIsMenuIconVisible(false);
          // }
          setMenuAnchorEl(null);
        }}
      >
        <List>
          {menuItems.map((item, index) => (
            <ListItemButton
              key={index}
              onClick={() => {
                item.action();
                setMenuAnchorEl(null);
              }}
            >
              {item.label}
            </ListItemButton>
          ))}
        </List>
      </Popover>
    </>
  );
}
