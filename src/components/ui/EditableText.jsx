import { TextField } from "@mui/material";
import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { debounce } from "redux-saga/effects";

const EditableText = ({
  initialValue,
  onChange,
  debounceDelay = 300, // in milliseconds
  placeholder = "Operation name",
}) => {
  const [localValue, setLocalValue] = useState(initialValue || "");

  // Update local state when initialValue changes
  useEffect(() => {
    setLocalValue(initialValue || "");
  }, [initialValue]);

  // Debounced effect to call onChange
  // This ensures that the onChange function is not called on every keystroke
  // but rather after the user has stopped typing for a specified delay.
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (localValue !== initialValue) {
        onChange(localValue);
      }
    }, debounceDelay);

    return () => clearTimeout(timeoutId);
  }, [localValue, initialValue, debounceDelay, onChange]);

  const handleChange = (event) => {
    setLocalValue(event.target.value);
  };

  return (
    <TextField
      value={localValue}
      onChange={handleChange}
      onBlur={handleChange}
      variant="standard"
      slotProps={{
        input: {
          style: {
            fontSize: "2rem",
            fontWeight: "bold",
          },
        },
      }}
      sx={{
        "& .MuiInput-underline:before": {
          borderBottomColor: "transparent",
        },
        "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
          borderBottomColor: "rgba(0, 0, 0, 0.42)",
        },
      }}
      placeholder={placeholder}
    />
  );
};

EditableText.propTypes = {
  initialValue: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  debounceDelay: PropTypes.number,
};

export default EditableText;
