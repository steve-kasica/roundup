import { darken, styled } from "@mui/material";

// Styled table row component that handles all drag and drop states
const StyledTableRow = styled("tr", {
  shouldForwardProp: (prop) =>
    !["isDragging", "isDisabled", "isSelected", "isHovered"].includes(prop),
})(({ theme, isDragging, isDisabled, isSelected, isHovered }) => {
  let styles = {
    transition: "all 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
    cursor: "pointer",
    borderRadius: "6px",
    position: "relative",
    margin: "1px 0",
    userSelect: "none",
    borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
    // make drag handle visible when the whole row is hovered
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
      ".drag-icon": {
        opacity: 1,
        transition: "all 0.18s ease-in-out",
      },
    },
  };

  // Base selected styles - blue theme for selection
  if (isSelected) {
    styles = {
      ...styles,
      backgroundColor: theme.palette.action.selected,
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
