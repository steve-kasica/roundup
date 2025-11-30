import { styled } from "@mui/material";

// Styled table row component that handles all drag and drop states
const StyledTableRow = styled("tr", {
  shouldForwardProp: (prop) =>
    ![
      "isDragging",
      "isDisabled",
      "isSelected",
      "isHovered",
      "totalCount",
    ].includes(prop),
})(({ isDragging, isDisabled, isSelected, isHovered, totalCount }) => {
  let styles = {
    transition: "all 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
    cursor: "pointer",
    borderRadius: "6px",
    position: "relative",
    margin: "1px 0",
    userSelect: "none",
    borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
    // make drag handle visible when the whole row is hovered
    "&:hover .drag-icon": {
      opacity: 1,
      transition: "all 0.18s ease-in-out",
    },
  };

  // Alert styles - orange/warning theme (highest priority after disabled)
  if (totalCount && !isDisabled) {
    styles = {
      ...styles,
      backgroundColor: "rgba(255, 152, 0, 0.12)",
      boxShadow: "inset 3px 0 0 #ff9800, 0 1px 3px rgba(255, 152, 0, 0.2)",
      borderLeft: "3px solid #ff9800",
    };
  }

  // Base selected styles - blue theme for selection
  if (isSelected && !totalCount) {
    styles = {
      ...styles,
      backgroundColor: "rgba(25, 118, 210, 0.12)",
      boxShadow: "inset 3px 0 0 #1976d2, 0 1px 3px rgba(25, 118, 210, 0.15)",
    };
  }

  // Hover styles - subtle gray with shadow
  if (isHovered && !isDragging && !isSelected && !totalCount) {
    styles = {
      ...styles,
      backgroundColor: "rgba(0, 0, 0, 0.02)",
      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
      transform: "translateY(-1px)",
    };
  }

  // Selected + Hovered - enhanced selected state
  if (isSelected && isHovered && !isDragging && !totalCount) {
    styles = {
      ...styles,
      backgroundColor: "rgba(25, 118, 210, 0.16)",
      boxShadow: "inset 3px 0 0 #1976d2, 0 2px 6px rgba(25, 118, 210, 0.2)",
      transform: "translateY(-1px)",
    };
  }

  // Alert + Hovered - enhanced alert state
  if (totalCount && isHovered && !isDragging && !isDisabled) {
    styles = {
      ...styles,
      backgroundColor: "rgba(255, 152, 0, 0.2)",
      boxShadow: "inset 3px 0 0 #ff9800, 0 2px 6px rgba(255, 152, 0, 0.3)",
      transform: "translateY(-1px)",
    };
  }

  // Dragging styles - orange theme with elevation
  if (isDragging) {
    styles = {
      ...styles,
      cursor: "grabbing",
      backgroundColor: "rgba(255, 152, 0, 0.15)",
      boxShadow: "inset 4px 0 0 #f57c00, 0 12px 24px rgba(255, 152, 0, 0.35)",
      zIndex: 1000,
      opacity: 0.95,
    };
  }

  // Disabled styles (highest priority) - maintains connection but muted
  if (isDisabled) {
    styles = {
      ...styles,
      opacity: 0.4,
      cursor: "not-allowed",
      backgroundColor: "rgba(0, 0, 0, 0.02)",
      transform: "none",
      boxShadow: "none",
    };
  }

  return styles;
});

export default StyledTableRow;
