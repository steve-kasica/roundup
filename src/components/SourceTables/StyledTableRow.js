import { darken, styled } from "@mui/material";

// Styled table row component that handles all drag and drop states
const StyledTableRow = styled("tr", {
  shouldForwardProp: (prop) =>
    !["isDragging", "isDisabled", "isSelected", "isHovered"].includes(prop),
})(({ theme, isDragging, isDisabled, isSelected, isHovered }) => {
  let styles = {
    transition: "all 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
    cursor: "pointer",
    userSelect: "none",
    "&:hover": {
      backgroundColor: theme.palette.grey[50],
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
      // transform: "translateX(2px)",
    },
  };

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
