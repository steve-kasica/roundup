/**
 * @fileoverview BarChart Component
 *
 * A comprehensive horizontal bar chart component with tooltips, infinite scrolling,
 * and loading states. Built with D3 for scaling and SVG rendering, supporting
 * large datasets with dynamic height adjustment.
 *
 * Features:
 * - Horizontal bar chart with D3 scales
 * - Tooltip with hover interactions
 * - Infinite scrolling support
 * - Loading state with skeleton bars
 * - Dynamic height based on data
 * - Customizable margins and formatting
 * - Scroll threshold detection
 * - Value and label display
 *
 * @module components/visualization/BarChart
 *
 * @example
 * <BarChart
 *   data={{ 'Category A': 100, 'Category B': 75 }}
 *   tooltipData={{ 'Category A': 'Details about A' }}
 *   title="Sales by Category"
 *   color="#3b82f6"
 *   xAxisLabel="Count"
 *   onScrollNearBottom={loadMore}
 *   isLoading={false}
 * />
 */

import PropTypes from "prop-types";
import { useEffect, useRef, useCallback, useState } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import { scaleLinear } from "d3";

const BarChart = ({
  data = {},
  tooltipData = {},
  title = "",
  color = "#3b82f6",
  xAxisLabel = "",
  marginTop = 0,
  marginRight = 0,
  marginBottom = 0,
  marginLeft = 0,
  minHeight = 300,
  barHeight = 20,
  barSpacing = 5,
  xAxisTicks = 5,
  formatValue = (v) => v,
  onScrollNearBottom = null,
  scrollThreshold = 0.9,
  isLoading = false,
}) => {
  const scrollContainerRef = useRef(null);
  const [hoveredBar, setHoveredBar] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const previousDataLengthRef = useRef(0);
  const scrollPositionRef = useRef(0);

  const handleScroll = useCallback(
    (event) => {
      if (!onScrollNearBottom) return;

      const { scrollTop, scrollHeight, clientHeight } = event.target;
      const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

      // Trigger callback when user scrolls past threshold
      if (scrollPercentage >= scrollThreshold && !isLoading) {
        onScrollNearBottom();
      }
    },
    [onScrollNearBottom, scrollThreshold, isLoading],
  );

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer && onScrollNearBottom) {
      scrollContainer.addEventListener("scroll", handleScroll, {
        passive: true,
      });
      return () => {
        scrollContainer.removeEventListener("scroll", handleScroll);
      };
    }
  }, [handleScroll, onScrollNearBottom]);

  // Preserve scroll position when data is appended
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const currentDataLength = Object.keys(data).length;

    // If data length increased (pagination loaded more), restore scroll position
    if (
      currentDataLength > previousDataLengthRef.current &&
      previousDataLengthRef.current > 0
    ) {
      scrollContainer.scrollTop = scrollPositionRef.current;
    }

    previousDataLengthRef.current = currentDataLength;
  }, [data]);

  // Save scroll position before data changes
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const saveScrollPosition = () => {
      scrollPositionRef.current = scrollContainer.scrollTop;
    };

    // Save scroll position periodically during scroll
    scrollContainer.addEventListener("scroll", saveScrollPosition, {
      passive: true,
    });

    return () => {
      scrollContainer.removeEventListener("scroll", saveScrollPosition);
    };
  }, []);

  if (!data || Object.keys(data).length === 0) {
    return (
      <Box
        className="bar-chart-container"
        sx={{
          minHeight: `${minHeight}px`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          No data available
        </Typography>
      </Box>
    );
  }

  const maxValue = Math.max(...Object.values(data));
  const xScale = scaleLinear().domain([0, maxValue]).range([0, 100]);
  const xAxisHeight = 30;
  const titleHeight = title ? 60 : 0;

  const barsContentHeight =
    Object.keys(data).length * (barHeight + barSpacing) +
    marginTop +
    marginBottom;
  const availableScrollHeight = minHeight - titleHeight - xAxisHeight;
  const shouldScroll = barsContentHeight > availableScrollHeight;

  return (
    <Box
      className="bar-chart-container"
      sx={{
        height: "100%",
        p: `${marginTop}px ${marginRight}px ${marginBottom}px ${marginLeft}px`,
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      {/* Fixed Title */}
      {title && (
        <Box
          sx={{
            p: 2,
            borderBottom: 1,
            borderColor: "divider",
            flexShrink: 0,
          }}
        >
          <Typography variant="h6" color="text.primary">
            {title}
          </Typography>
        </Box>
      )}

      {/* Fixed X-axis labels at top */}
      <Box
        sx={{
          height: `${xAxisHeight}px`,
          display: "flex",
          flexDirection: "column",
          paddingBottom: 0.5,
          marginBottom: 0.75,
          flexShrink: 0,
          position: "relative",
        }}
      >
        {xAxisLabel && (
          <Typography
            variant="caption"
            sx={{ fontWeight: 500, mb: 0.25, userSelect: "none" }}
            color="text.secondary"
          >
            {xAxisLabel}
          </Typography>
        )}
        <Box
          sx={{
            display: "flex",
            width: "100%",
            position: "relative",
          }}
        >
          {xScale.ticks(xAxisTicks).map((value, i, arr) => {
            return (
              <Box
                key={i}
                sx={{
                  display: "flex",
                  left: `${xScale(value)}%`,
                  transform: `translateX(-${xScale(0)}%)`,
                  width: i === 0 ? "0px" : i === arr.length - 1 ? "0px" : "1px",
                  height: "100%",
                  flexDirection: "column",
                  alignItems: "center",
                  position: "relative",
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    userSelect: "none",
                  }}
                >
                  {formatValue(value)}
                </Typography>
                <Box
                  sx={{
                    width: "1px",
                    height: "4px",
                    backgroundColor: "#000",
                  }}
                />
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Scrollable bars container */}
      <Box
        ref={scrollContainerRef}
        sx={{
          flex: 1,
          overflowY: shouldScroll ? "auto" : "visible",
          position: "relative",
        }}
      >
        <Box
          sx={{
            position: "relative",
            height: `${barsContentHeight}px`,
          }}
        >
          {Object.entries(data).map(([label, value], index) => {
            const barWidth = xScale(value);
            const yPosition = index * (barHeight + barSpacing);
            const showValueOutside = barWidth < 75;
            const isHovered = hoveredBar === label;
            const shouldDim = hoveredBar !== null && !isHovered;

            return (
              <Box
                key={index}
                sx={{
                  position: "absolute",
                  top: `${yPosition}px`,
                  left: 0,
                  right: 0,
                  height: `${barHeight}px`,
                  display: "flex",
                  alignItems: "center",
                  opacity: shouldDim ? 0.25 : 1,
                  transition: "opacity 0.2s ease-in-out",
                }}
              >
                {/* Bar container */}
                <Box
                  sx={{
                    flex: 1,
                    height: "100%",
                    position: "relative",
                    overflow: "hidden",
                    cursor: "pointer",
                  }}
                >
                  {/* Background bar */}
                  <Box
                    sx={{
                      position: "absolute",
                      width: `${barWidth}%`,
                      height: "100%",
                      backgroundColor: color,
                      transition:
                        "width 0.3s ease-in-out, filter 0.2s ease-in-out, transform 0.2s ease-in-out",
                      "&:hover": {
                        filter: "brightness(1.15)",
                        transform: "scaleY(1.1)",
                      },
                    }}
                  />

                  {/* Content layer */}
                  <Box
                    sx={{
                      position: "relative",
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: showValueOutside
                        ? "flex-start"
                        : "space-between",
                    }}
                  >
                    {/* Label inset on left */}
                    <Typography
                      variant="data-primary"
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        wordBreak: "keep-all",
                        pl: 0.5,
                        userSelect: "none",
                      }}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setHoveredBar(label);
                        setTooltipPosition({
                          x: e.clientX,
                          y: rect.top,
                        });
                      }}
                      onMouseMove={(e) => {
                        setTooltipPosition({
                          x: e.clientX,
                          y: e.clientY,
                        });
                      }}
                      onMouseLeave={() => {
                        setHoveredBar(null);
                      }}
                    >
                      {label}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>

        {/* Loading indicator at bottom */}
        {isLoading && (
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "30px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(255, 255, 255, 0.9)",
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
              Loading more...
            </Typography>
            <CircularProgress size={16} />
          </Box>
        )}
      </Box>

      {/* Tooltip */}
      {hoveredBar && (
        <Box
          sx={{
            position: "fixed",
            left: `${tooltipPosition.x + 10}px`,
            top: `${tooltipPosition.y - 10}px`,
            backgroundColor: "rgba(0, 0, 0, 0.9)",
            color: "#ffffff",
            p: 1,
            borderRadius: 1,
            pointerEvents: "none",
            zIndex: 1000,
            maxWidth: "300px",
            wordWrap: "break-word",
            boxShadow: 2,
          }}
        >
          <Typography variant="caption">
            {tooltipData[hoveredBar] || `${formatValue(data[hoveredBar])}`}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

BarChart.propTypes = {
  data: PropTypes.objectOf(PropTypes.number),
  tooltipData: PropTypes.objectOf(PropTypes.string),
  title: PropTypes.string,
  color: PropTypes.string,
  xAxisLabel: PropTypes.string,
  marginTop: PropTypes.number,
  marginRight: PropTypes.number,
  marginBottom: PropTypes.number,
  marginLeft: PropTypes.number,
  minHeight: PropTypes.number,
  barHeight: PropTypes.number,
  barSpacing: PropTypes.number,
  formatValue: PropTypes.func,
  onScrollNearBottom: PropTypes.func,
  scrollThreshold: PropTypes.number,
  isLoading: PropTypes.bool,
};

export default BarChart;
