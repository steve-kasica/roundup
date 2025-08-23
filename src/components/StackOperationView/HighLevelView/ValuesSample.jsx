import { Typography } from "@mui/material";
import PropTypes from "prop-types";
import { useState, useRef, useEffect } from "react";

/**
 * A component that displays column values as individual chips
 */
export default function ValuesSample({ values }) {
  const sample = values.slice(0, 3);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const textRef = useRef(null);

  // Check for text overflow
  useEffect(() => {
    const checkOverflow = () => {
      if (textRef.current) {
        const element = textRef.current;
        setIsOverflowing(element.scrollWidth > element.clientWidth);
      }
    };

    checkOverflow();
    // Recheck on window resize
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [sample]); // Rerun when sample changes

  // Handle mouse leave to reset scroll position
  const handleMouseLeave = () => {
    if (textRef.current) {
      textRef.current.scrollLeft = 0;
    }
  };

  return (
    <Typography
      ref={textRef}
      variant="caption"
      component="p"
      onMouseLeave={handleMouseLeave}
      sx={{
        fontSize: "0.7rem",
        fontStyle: "italic",
        fontWeight: 300,
        overflow: "hidden",
        textAlign: "left",
        textOverflow: "ellipsis",
        color: "text.secondary",
        whiteSpace: "nowrap",
        maxWidth: "100%",
        width: "100%",
        cursor: isOverflowing ? "ew-resize" : "inherit",
        "&:hover": {
          overflowX: "auto",
          textOverflow: "clip",
          // Hide scrollbar in all browsers
          scrollbarWidth: "none", // Firefox
          "&::-webkit-scrollbar": {
            display: "none", // Chrome, Safari, Edge
          },
          "-ms-overflow-style": "none", // Internet Explorer/Edge
        },
      }}
    >
      {sample.join(", ")}
    </Typography>
  );
}

ValuesSample.propTypes = {
  values: PropTypes.object.isRequired,
};
