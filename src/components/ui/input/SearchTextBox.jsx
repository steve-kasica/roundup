/**
 * @fileoverview SearchTextBox Component
 *
 * A search input component with debounced updates and a context menu for search options.
 * Provides a clean interface for filtering data with advanced search settings.
 *
 * Features:
 * - Debounced search input to reduce update frequency
 * - Clear button for quick reset
 * - Context menu with search options
 * - Search icon with visual feedback
 * - Customizable placeholder
 * - Controlled input with local state management
 *
 * @module components/ui/SearchTextBox
 *
 * @example
 * <SearchTextBox
 *   placeholder="Search tables..."
 *   setSearchString={handleSearch}
 * />
 */

import { InputAdornment, TextField } from "@mui/material";
import { SearchIcon } from "lucide-react";
import { useState, useEffect, useRef } from "react";

const SearchTextBox = ({
  placeholder = "Search...",
  //   searchString,
  onChange,
  sx = {},
  delay = 300,
}) => {
  const [localValue, setLocalValue] = useState("");
  const debounceTimerRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

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
        onChange(value);
      }
    }, delay);
  };
  return (
    <>
      <TextField
        placeholder={placeholder}
        size="small"
        fullWidth
        value={localValue}
        onChange={handleOnChange}
        aria-label={placeholder}
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
          ...sx,
        }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          },
        }}
      />
    </>
  );
};

export default SearchTextBox;
