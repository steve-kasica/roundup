import { darken, lighten, styled } from "@mui/material";

// Styled table row component that handles all drag and drop states
const StyledTableRow = styled("tr", {
  shouldForwardProp: (prop) =>
    ![
      "isDragging",
      "isDisabled",
      "isSelected",
      "isHovered",
      "isFocused",
    ].includes(prop),
})(({ theme, isDragging, isDisabled, isSelected, isHovered, isFocused }) => {
  let styles = {
    transition: "all 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
    cursor: "pointer",
    userSelect: "none",
    borderColor: theme.palette.grey[300],
    "&:hover": {
      backgroundColor: isFocused
        ? theme.palette.action.hover
        : theme.palette.grey[50],
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
    },
  };

  // Focused styles - distinct from selected
  if (isFocused) {
    styles = {
      ...styles,
      backgroundColor: theme.palette.action.focus,
      borderColor: theme.palette.grey[500],
    };
  }

  // // Disabled styles (highest priority) - maintains connection but muted
  if (isDisabled) {
    styles = {
      ...styles,
      opacity: theme.palette.action.disabledOpacity,
      cursor: "not-allowed",
      transform: "none",
      boxShadow: "none",
    };
  }

  return styles;
});

export default StyledTableRow;
