import { useState, useMemo } from "react";
import { Box, Typography } from "@mui/material";
import PropTypes from "prop-types";
import ValueView from "./ValueView";
import Bar from "./Bar";
import { max, scaleLinear } from "d3";
import Edges from "./Edges";

const rowMargin = 5; // in pixels, controls the gab between match groups
const valueHeight = 38.02; // in pixels, height of each value row, including margin

function MatchDetails({ matches, leftTitle, rightTitle, barColor, fontSize }) {
  // Sorting state
  const [sortBy, setSortBy] = useState(null); // 'left', 'right', or 'count'
  const [sortOrder, setSortOrder] = useState("asc"); // 'asc' or 'desc'

  const xScale = scaleLinear()
    .domain([
      0,
      max(matches, ({ left, right }) => Math.max(1, left.count * right.count)),
    ])
    .range([0, 100]);

  // Compute match groups only when matches change (expensive operation)
  const rawMatchGroups = useMemo(() => {
    const leftToRight = new Map();
    const rightToLeft = new Map();

    // Build bidirectional adjacency lists
    matches.forEach(({ left, right }) => {
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
        matches.forEach((match) => {
          if (
            component.leftValues.has(match.left.value) &&
            component.rightValues.has(match.right.value)
          ) {
            component.matches.push(match);
          }
        });

        // Calculate rowCounts for each right value in this component
        component.rowCounts = [...component.rightValues].map((value, i) => {
          const rowCount = component.matches.reduce(
            (count, { left, right }) =>
              right.value === value
                ? count + Math.max(1, left.count * right.count)
                : count,
            0
          );
          return rowCount;
        });

        component.leftCounts = new Map(
          component.matches.map((match) => [match.left.value, match.left.count])
        );
        component.rightCounts = new Map(
          component.matches.map((match) => [
            match.right.value,
            match.right.count,
          ])
        );

        components.push(component);
      }
    }

    return components;
  }, [matches]);

  // Sort components and their internal matches based on current sort settings (cheap operation)
  const sortedMatchGroups = useMemo(() => {
    return rawMatchGroups
      .map((component) => {
        // Sort matches within each component
        const sortedMatches = [...component.matches].sort((a, b) => {
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

          let comparison = 0;
          if (typeof aValue === "string" && typeof bValue === "string") {
            comparison = aValue.localeCompare(bValue);
          } else {
            comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
          }

          return sortOrder === "asc" ? comparison : -comparison;
        });

        return {
          ...component,
          matches: sortedMatches,
        };
      })
      .sort((a, b) => {
        // Sort components themselves
        if (!sortBy) return 0;

        let aValue, bValue;

        if (sortBy === "left") {
          aValue = a.leftValues.size;
          bValue = b.leftValues.size;
        } else if (sortBy === "right") {
          aValue = a.rightValues.size;
          bValue = b.rightValues.size;
        } else if (sortBy === "count") {
          aValue = Math.max(...a.rowCounts);
          bValue = Math.max(...b.rowCounts);
        }

        let comparison = 0;
        if (typeof aValue === "string" && typeof bValue === "string") {
          comparison = aValue.localeCompare(bValue);
        } else {
          comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        }

        return sortOrder === "asc" ? comparison : -comparison;
      });
  }, [rawMatchGroups, sortBy, sortOrder]);

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
        {sortedMatchGroups.map(
          (
            {
              leftValues,
              rightValues,
              matches,
              rowCounts,
              leftCounts,
              rightCounts,
            },
            i
          ) => (
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                flex: 1,
                alignItems: "flex-start",
                textAlign: "center",
                position: "relative",
                paddingBottom: rowMargin + "px",
                paddingTop: rowMargin + "px",
              }}
              key={`${i}`}
            >
              <Box sx={{ width: "40%" }}>
                {[...leftValues].map((value, index) => (
                  <ValueView
                    key={`left-${index}`}
                    value={value}
                    matchCount={leftCounts.get(value)}
                  />
                ))}
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
                <Edges
                  leftValues={leftValues}
                  rightValues={rightValues}
                  matches={matches}
                  itemHeight={valueHeight}
                />
              </Box>
              <Box sx={{ width: "40%" }}>
                {[...rightValues].map((value, index) => (
                  <ValueView
                    key={`right-${index}`}
                    value={value}
                    matchCount={rightCounts.get(value)}
                  />
                ))}
              </Box>
              <Box sx={{ width: "20%", paddingLeft: "8px", height: "inherit" }}>
                {rowCounts.map((value, i) => (
                  <Bar
                    key={`bar-${i}`}
                    value={value}
                    height={valueHeight}
                    width={xScale(value)}
                    barColor={barColor}
                    backgroundColor="#f0f0f0"
                    opacity={0.7}
                  />
                ))}
              </Box>
            </div>
          )
        )}
      </div>
    </>
  );
}

MatchDetails.propTypes = {
  matches: PropTypes.arrayOf(
    PropTypes.shape({
      left: PropTypes.shape({
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
          .isRequired,
        count: PropTypes.number.isRequired,
      }).isRequired,
      right: PropTypes.shape({
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
          .isRequired,
        count: PropTypes.number.isRequired,
      }).isRequired,
    })
  ).isRequired,
  leftTitle: PropTypes.string.isRequired,
  rightTitle: PropTypes.string.isRequired,
  barColor: PropTypes.string.isRequired,
  fontSize: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
};

export default MatchDetails;
