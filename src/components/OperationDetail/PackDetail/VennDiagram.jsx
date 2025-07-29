import { useState } from "react";
import { Box, Typography } from "@mui/material";
import PropTypes from "prop-types";

const VennDiagram = ({
  leftLabel = "Table A",
  rightLabel = "Table B",
  onJoinTypeChange,
  selectedJoinType = "inner",
}) => {
  const [hoveredRegion, setHoveredRegion] = useState(null);

  const handleRegionClick = (joinType) => {
    onJoinTypeChange(joinType);
  };

  const getRegionColor = (region) => {
    if (selectedJoinType === region) {
      return "#2196f3"; // Blue for selected
    }
    if (hoveredRegion === region) {
      return "#64b5f6"; // Light blue for hover
    }
    return "#e3f2fd"; // Very light blue for default
  };

  const getRegionOpacity = (region) => {
    if (selectedJoinType === region) return 0.8;
    if (hoveredRegion === region) return 0.6;
    return 0.3;
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        p: 2,
      }}
    >
      <Typography variant="h6" gutterBottom>
        Select Join Type
      </Typography>

      <svg
        width="300"
        height="200"
        viewBox="0 0 300 200"
        style={{ cursor: "pointer" }}
      >
        {/* Left circle (Table A) */}
        <circle
          cx="100"
          cy="100"
          r="60"
          fill={getRegionColor("left")}
          fillOpacity={getRegionOpacity("left")}
          stroke="#1976d2"
          strokeWidth="2"
          onClick={() => handleRegionClick("left")}
          onMouseEnter={() => setHoveredRegion("left")}
          onMouseLeave={() => setHoveredRegion(null)}
        />

        {/* Right circle (Table B) */}
        <circle
          cx="200"
          cy="100"
          r="60"
          fill={getRegionColor("right")}
          fillOpacity={getRegionOpacity("right")}
          stroke="#1976d2"
          strokeWidth="2"
          onClick={() => handleRegionClick("right")}
          onMouseEnter={() => setHoveredRegion("right")}
          onMouseLeave={() => setHoveredRegion(null)}
        />

        {/* Define clipping path for intersection */}
        <defs>
          <clipPath id="intersectionClip">
            <circle cx="100" cy="100" r="60" />
          </clipPath>
        </defs>

        {/* Intersection region (Inner join) */}
        <circle
          cx="200"
          cy="100"
          r="60"
          fill={getRegionColor("inner")}
          fillOpacity={getRegionOpacity("inner")}
          stroke="#1976d2"
          strokeWidth="1"
          clipPath="url(#intersectionClip)"
          onClick={() => handleRegionClick("inner")}
          onMouseEnter={() => setHoveredRegion("inner")}
          onMouseLeave={() => setHoveredRegion(null)}
        />

        {/* Labels */}
        <text
          x="70"
          y="105"
          textAnchor="middle"
          fontSize="12"
          fill="#333"
          pointerEvents="none"
        >
          {leftLabel}
        </text>

        <text
          x="230"
          y="105"
          textAnchor="middle"
          fontSize="12"
          fill="#333"
          pointerEvents="none"
        >
          {rightLabel}
        </text>
      </svg>

      {/* Join type descriptions */}
      <Box sx={{ mt: 2, textAlign: "center" }}>
        {selectedJoinType === "left" && (
          <Typography variant="body2" color="primary">
            Left Join: All records from {leftLabel}, matching records from{" "}
            {rightLabel}
          </Typography>
        )}
        {selectedJoinType === "right" && (
          <Typography variant="body2" color="primary">
            Right Join: All records from {rightLabel}, matching records from{" "}
            {leftLabel}
          </Typography>
        )}
        {selectedJoinType === "inner" && (
          <Typography variant="body2" color="primary">
            Inner Join: Only matching records from both tables
          </Typography>
        )}
        {hoveredRegion && hoveredRegion !== selectedJoinType && (
          <Typography variant="body2" color="text.secondary">
            Click to select {hoveredRegion} join
          </Typography>
        )}
      </Box>
    </Box>
  );
};

VennDiagram.propTypes = {
  leftLabel: PropTypes.string,
  rightLabel: PropTypes.string,
  onJoinTypeChange: PropTypes.func.isRequired,
  selectedJoinType: PropTypes.oneOf(["left", "right", "inner"]),
};

export default VennDiagram;
