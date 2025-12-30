/**
 * @fileoverview EditableText Component
 *
 * An inline editable text component with debounced updates, read-only mode support,
 * and automatic focus management. Allows users to edit text directly in place with
 * visual feedback for hover and edit states.
 *
 * Features:
 * - Inline editing with double-click to activate
 * - Debounced onChange to reduce update frequency
 * - Read-only mode for non-editable display
 * - Automatic focus management
 * - Placeholder support
 * - Customizable font size
 * - Edit state change callbacks
 * - Click-away to save
 *
 * @module components/ui/EditableText
 *
 * @example
 * <EditableText
 *   initialValue="Table Name"
 *   onChange={(newValue) => updateName(newValue)}
 *   isEditable={true}
 *   debounceDelay={300}
 *   placeholder="Enter name"
 * />
 */

import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";

const EditableText = ({
  initialValue,
  onChange,
  inputRef = null,
  isReadOnly = false,
  isEditable = false,
  debounceDelay = 300, // in milliseconds
  placeholder = "Lorem",
  fontSize = "2rem",
  onEditingStateChange, // Callback to notify parent of editing state changes
}) => {
  const [localValue, setLocalValue] = useState(initialValue || "");
  const internalRef = useRef(null);

  // Combine refs and expose focus/select methods to parent
  const combinedRef = (element) => {
    internalRef.current = element;
    if (inputRef) {
      if (typeof inputRef === "function") {
        inputRef(element);
      } else {
        inputRef.current = element;
        // Expose methods for parent to control editing
        if (element) {
          inputRef.current.focusAndSelect = () => {
            element.focus();
            element.select();
          };
        }
      }
    }
  };

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
    event.preventDefault();
    setLocalValue(event.target.value);
  };

  const handleFocus = (event) => {
    // Only allow focus if editable is enabled by parent
    if (isReadOnly && !isEditable) {
      event.target.blur();
    }
  };

  const handleBlur = (event) => {
    // Notify parent that editing has ended
    if (onEditingStateChange) {
      onEditingStateChange(false);
    }
    handleChange(event);
  };

  return (
    <input
      type="text"
      ref={combinedRef}
      value={localValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      readOnly={isReadOnly && !isEditable}
      style={{
        // TODO: what's up here?
        // width: `${localValue.length + 2}ch`,
        // maxWidth: "100px",
        background: "transparent",
        border: "none",
        cursor: isReadOnly && !isEditable ? "inherit" : "text",
        // Remove default focus outline and box shadow
        // This is necessary to prevent the default browser styles from interfering
        // with the custom styles applied to the input.
        outline: "none", // Remove default focus outline
        boxShadow: "none", // Remove default focus box shadow
        fontSize,
        fontWeight: "bold",
        textOverflow: "ellipsis",
        overflow: "hidden",
        whiteSpace: "nowrap",
        padding: 0,
      }}
      placeholder={placeholder}
    />
  );
};

EditableText.propTypes = {
  initialValue: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  isReadOnly: PropTypes.bool,
  isEditable: PropTypes.bool,
  debounceDelay: PropTypes.number,
  fontSize: PropTypes.string,
  maxWidth: PropTypes.string,
  inputRef: PropTypes.object,
  onEditingStateChange: PropTypes.func,
};

export default EditableText;
