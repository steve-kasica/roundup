import { Box, Typography, Tooltip, Chip } from "@mui/material";
import PropTypes from "prop-types";
import { useRef, useEffect, useState } from "react";

function ValueView({ value = null, matchCount, height = "100%" }) {
  const isNull = value === null || value === undefined;
  const textRef = useRef(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      if (textRef.current) {
        const isTextOverflowing =
          textRef.current.scrollWidth > textRef.current.clientWidth;
        setIsOverflowing(isTextOverflowing);
      }
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [value]);

  const displayValue = isNull ? "null" : String(value);

  return (
    <Box
      sx={{
        textAlign: "left",
        border: isNull ? "1px dashed #bbb" : "1px solid #ccc",
        height,
        borderRadius: "5px",
        px: 2,
        py: 1,
        backgroundColor: isNull ? "#f9f9f9" : "transparent",
        opacity: isNull ? 0.7 : 1,
        cursor: "default",
      }}
    >
      <Tooltip
        title={displayValue}
        disableHoverListener={!isOverflowing}
        arrow
        placement="top"
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            gap: 1,
          }}
        >
          <Typography
            ref={textRef}
            variant="body2"
            sx={{
              fontWeight: "medium",
              color: isNull ? "#888" : "#333",
              whiteSpace: "nowrap",
              fontStyle: isNull ? "italic" : "normal",
              overflow: "hidden",
              textOverflow: "ellipsis",
              flex: 1,
            }}
          >
            {displayValue}
          </Typography>
          <Chip
            label={matchCount || 0}
            size="small"
            title={`Row count: ${matchCount || 0}`}
            sx={{
              height: "20px",
              fontSize: "10px",
              backgroundColor: "#f5f5f5",
              color: "#666",
              "& .MuiChip-label": {
                padding: "0 6px",
              },
            }}
          />
        </Box>
      </Tooltip>
    </Box>
  );
}

ValueView.propTypes = {
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.oneOf([null, undefined]),
  ]),
  matchCount: PropTypes.number,
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

ValueView.defaultProps = {
  value: null,
  matchCount: 0,
  height: "100%",
};

export default ValueView;
