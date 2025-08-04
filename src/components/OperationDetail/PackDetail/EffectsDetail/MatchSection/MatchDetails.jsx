import { useState } from "react";
import { Box, Typography } from "@mui/material";
import ValueView from "./ValueView";
import Bar from "./Bar";
import { max, scaleLinear } from "d3";

// const itemHeight = 12; // in pixels
const rowHeight = 30; // in pixels
const rowMargin = 8; // in pixels

function MatchDetails({
  matches,
  leftTitle,
  rightTitle,
  barColor,
  fontSize,
  totalMatches,
}) {
  // Sorting state
  const [sortBy, setSortBy] = useState(null); // 'left', 'right', or 'count'
  const [sortOrder, setSortOrder] = useState("asc"); // 'asc' or 'desc'

  const xScale = scaleLinear()
    .domain([
      0,
      max(matches, ({ left, right }) => Math.max(1, left.count * right.count)),
    ])
    .range([0, 100]);

  // Sort matches based on current sort settings
  const sortedMatches = [...matches].sort((a, b) => {
    if (!sortBy) return 0;

    let aValue, bValue;

    if (sortBy === "left") {
      aValue = a.left.value;
      bValue = b.left.value;
    } else if (sortBy === "right") {
      aValue = a.right.value;
      bValue = b.right.value;
    } else if (sortBy === "count") {
      aValue = a.left.count * a.right.count;
      bValue = b.left.count * b.right.count;
    }

    // Handle different data types
    let comparison = 0;
    if (typeof aValue === "string" && typeof bValue === "string") {
      comparison = aValue.localeCompare(bValue);
    } else {
      comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    }

    return sortOrder === "asc" ? comparison : -comparison;
  });

  // Group matches into connected components
  const matchGroups = (() => {
    const leftToRight = new Map();
    const rightToLeft = new Map();

    // Build bidirectional adjacency lists
    sortedMatches.forEach(({ left, right }) => {
      const leftVal = left.value;
      const rightVal = right.value;

      if (!leftToRight.has(leftVal)) leftToRight.set(leftVal, new Set());
      if (!rightToLeft.has(rightVal)) rightToLeft.set(rightVal, new Set());

      leftToRight.get(leftVal).add(rightVal);
      rightToLeft.get(rightVal).add(leftVal);
    });

    const visited = new Set();
    const components = [];

    // DFS to find connected components
    function dfs(value, isLeft, component) {
      const key = `${isLeft ? "L" : "R"}:${value}`;
      if (visited.has(key)) return;

      visited.add(key);
      if (isLeft) {
        component.leftValues.add(value);
        const rightNeighbors = leftToRight.get(value) || new Set();
        rightNeighbors.forEach((rightVal) => dfs(rightVal, false, component));
      } else {
        component.rightValues.add(value);
        const leftNeighbors = rightToLeft.get(value) || new Set();
        leftNeighbors.forEach((leftVal) => dfs(leftVal, true, component));
      }
    }

    // Find all connected components
    for (const [leftVal] of leftToRight) {
      const key = `L:${leftVal}`;
      if (!visited.has(key)) {
        const component = {
          leftValues: new Set(),
          rightValues: new Set(),
          matches: [],
        };
        dfs(leftVal, true, component);

        // Reconstruct matches for this component
        sortedMatches.forEach((match) => {
          if (
            component.leftValues.has(match.left.value) &&
            component.rightValues.has(match.right.value)
          ) {
            component.matches.push(match);
          }
        });

        components.push(component);
      }
    }

    return components;
  })();

  console.log("Match Groups:", matchGroups);

  // Handle column header clicks
  const handleSort = (column) => {
    if (sortBy === column) {
      // Toggle sort order if clicking the same column
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // Set new column and default to ascending
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  // Get sort indicator for column headers
  const getSortIndicator = (column) => {
    if (sortBy !== column) return "";
    return sortOrder === "asc" ? " ↑" : " ↓";
  };

  return (
    <>
      {/* Fixed header with clickable sorting */}
      <div
        style={{
          display: "flex",
          textAlign: "center",
          fontWeight: "bold",
          padding: "8px 0",
          borderBottom: "1px solid #ddd",
          backgroundColor: "#f8f9fa",
          position: "sticky",
          top: 0,
          zIndex: 2,
          marginBottom: "16px",
        }}
      >
        <div style={{ width: "40%" }}>
          <Typography
            variant="body2"
            sx={{
              fontSize,
              cursor: "pointer",
              userSelect: "none",
              "&:hover": {
                color: barColor,
              },
            }}
            onClick={() => handleSort("left")}
          >
            {leftTitle}
            {getSortIndicator("left")}
          </Typography>
        </div>
        <div style={{ width: "40%" }}>
          <Typography
            variant="body2"
            sx={{
              fontSize,
              cursor: "pointer",
              userSelect: "none",
              "&:hover": {
                color: barColor,
              },
            }}
            onClick={() => handleSort("right")}
          >
            {rightTitle}
            {getSortIndicator("right")}
          </Typography>
        </div>
        <div style={{ width: "20%" }}>
          <Typography
            variant="body2"
            sx={{
              fontSize,
              cursor: "pointer",
              userSelect: "none",
              "&:hover": {
                color: barColor,
              },
            }}
            onClick={() => handleSort("count")}
          >
            Row count
            {getSortIndicator("count")}
          </Typography>
        </div>
      </div>

      {/* Scrollable content */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
      >
        {sortedMatches.map(({ left, right }, i) => (
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              flex: 1,
              alignItems: "center",
              textAlign: "center",
              position: "relative",
              height: rowHeight + "px",
              paddingBottom: rowMargin + "px",
              paddingTop: rowMargin + "px",
            }}
            key={`${left.value}-${right.value}-${i}`}
          >
            <Box sx={{ width: "40%" }}>
              <ValueView value={left.value} matchCount={left.count} />
            </Box>
            <Box
              sx={{
                width: "10%",
                paddingLeft: "0px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="100%"
                height={rowHeight + "px"}
                style={{ overflow: "visible" }}
              >
                <line
                  x1="0"
                  y1={"50%"}
                  x2="100%"
                  y2={"50%"}
                  stroke={barColor}
                  strokeWidth="1"
                  opacity="0.6"
                />
              </svg>
            </Box>
            <Box sx={{ width: "40%" }}>
              <ValueView value={right.value} matchCount={right.count} />
            </Box>
            <Box sx={{ width: "20%", paddingLeft: "8px", height: "inherit" }}>
              <Bar
                value={Math.max(left.count * right.count, 1)}
                width={xScale(left.count * right.count)}
                barColor={barColor}
                backgroundColor="#f0f0f0"
                opacity={0.7}
              />
            </Box>
          </div>
        ))}
      </div>
    </>
  );
}

export default MatchDetails;
