import { MoreVert } from "@mui/icons-material";
import {
  Divider,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  TextField,
} from "@mui/material";
import { SearchIcon } from "lucide-react";
import { useState, useEffect, useRef } from "react";

const SearchTextBox = ({
  placeholder = "Search...",
  //   searchString,
  onChange,
}) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [localValue, setLocalValue] = useState("");
  const menuOpen = Boolean(menuAnchorEl);
  const debounceTimerRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleMenuOpen = (event) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleOnChange = (e) => {
    const value = e.target.value;
    setLocalValue(value);

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      if (onChange) {
        const trimmedLowercased = value.trim().toLowerCase();
        onChange(trimmedLowercased);
      }
    }, 300);
  };
  return (
    <>
      <TextField
        placeholder={placeholder}
        size="small"
        fullWidth
        value={localValue}
        onChange={handleOnChange}
        sx={{
          "& .MuiOutlinedInput-root": {
            backgroundColor: "#f5f5f5",
            border: "1px solid #d0d0d0",
            "&:hover": {
              backgroundColor: "#f0f0f0",
              border: "1px solid #c0c0c0",
            },
            "&.Mui-focused": {
              backgroundColor: "#ffffff",
              border: "1px solid #1976d2",
            },
            "& fieldset": {
              border: "none",
            },
          },
        }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={handleMenuOpen}
                  aria-haspopup="true"
                  aria-expanded={menuOpen ? "true" : undefined}
                >
                  <MoreVert />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />
      <Menu
        anchorEl={menuAnchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
        onClick={handleMenuClose}
      >
        <MenuItem
          disabled={!localValue}
          onClick={() => {
            setLocalValue("");
            if (onChange) onChange("");
          }}
        >
          Clear search
        </MenuItem>
        {/* <MenuItem
          onClick={() => {
            onSelectAll();
            handleMenuClose();
          }}
        >
          Select all
        </MenuItem>
        <MenuItem
          disabled={selectedTables.length === 0}
          onClick={() => {
            onDeleteAll();
            handleMenuClose();
          }}
        >
          Delete all
        </MenuItem>
        <MenuItem
          disabled={selectedTables.length === 0}
          onClick={() => {
            onClearSelection();
            handleMenuClose();
          }}
        >
          Clear selection
        </MenuItem>
        <Divider /> */}
        {/* <MenuItem
          onClick={() => {
            document.getElementById("file-upload-input")?.click();
            handleMenuClose();
          }}
        >
          Upload more files
        </MenuItem> */}
      </Menu>
    </>
  );
};

export default SearchTextBox;
