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
  formatValue = (v) => v,
  onScrollNearBottom = null,
  scrollThreshold = 0.9,
  isLoading = false,
}) => {
  const scrollContainerRef = useRef(null);
  const [hoveredBar, setHoveredBar] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

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
    [onScrollNearBottom, scrollThreshold, isLoading]
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

  if (!data || Object.keys(data).length === 0) {
    return (
      <div
        className="bar-chart-container"
        style={{ minHeight: `${minHeight}px` }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            color: "#6b7280",
          }}
        >
          No data available
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...Object.values(data));
  const xAxisHeight = 30;
  const titleHeight = title ? 60 : 0;

  const barsContentHeight =
    Object.keys(data).length * (barHeight + barSpacing) +
    marginTop +
    marginBottom;
  const availableScrollHeight = minHeight - titleHeight - xAxisHeight;
  const shouldScroll = barsContentHeight > availableScrollHeight;

  return (
    <div
      className="bar-chart-container"
      style={{
        height: "100%",
        padding: `${marginTop}px ${marginRight}px ${marginBottom}px ${marginLeft}px`,
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      {/* Fixed Title */}
      {title && (
        <div
          style={{
            padding: "16px",
            borderBottom: "1px solid #e5e7eb",
            fontSize: "18px",
            fontWeight: "600",
            color: "#111827",
            flexShrink: 0,
          }}
        >
          {title}
        </div>
      )}

      {/* Fixed X-axis labels at top */}
      <div
        style={{
          height: `${xAxisHeight}px`,
          display: "flex",
          flexDirection: "column",
          fontSize: "12px",
          color: "#6b7280",
          borderBottom: "1px solid #e5e7eb",
          flexShrink: 0,
        }}
      >
        {xAxisLabel && (
          <span style={{ fontWeight: "500", marginBottom: "2px" }}>
            {xAxisLabel}
          </span>
        )}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <span>0</span>
          <span style={{ textAlign: "right" }}>{formatValue(maxValue)}</span>
        </div>
      </div>

      {/* Scrollable bars container */}
      <div
        ref={scrollContainerRef}
        style={{
          flex: 1,
          overflowY: shouldScroll ? "auto" : "visible",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "relative",
            height: `${barsContentHeight}px`,
          }}
        >
          {Object.entries(data).map(([label, value], index) => {
            const barWidth = Math.max(
              20,
              maxValue > 0 ? (value / maxValue) * 100 : 0
            );
            const yPosition = index * (barHeight + barSpacing);
            const showValueOutside = barWidth < 75;
            const tooltipText = tooltipData[label];

            return (
              <div
                key={index}
                style={{
                  position: "absolute",
                  top: `${yPosition}px`,
                  left: "0",
                  right: "0",
                  height: `${barHeight}px`,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {/* Bar container */}
                <div
                  style={{
                    flex: 1,
                    height: "100%",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* Actual bar */}
                  <div
                    style={{
                      width: `${barWidth}%`,
                      height: "100%",
                      backgroundColor: color,
                      transition:
                        "width 0.3s ease-in-out, filter 0.2s ease-in-out, transform 0.2s ease-in-out",
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: showValueOutside
                        ? "flex-start"
                        : "space-between",
                      cursor: tooltipText ? "pointer" : "default",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.filter = "brightness(1.15)";
                      e.currentTarget.style.transform = "scaleY(1.1)";
                      if (tooltipText) {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setHoveredBar(label);
                        setTooltipPosition({
                          x: e.clientX,
                          y: rect.top,
                        });
                      }
                    }}
                    onMouseMove={(e) => {
                      if (tooltipText) {
                        setTooltipPosition({
                          x: e.clientX,
                          y: e.clientY,
                        });
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.filter = "brightness(1)";
                      e.currentTarget.style.transform = "scaleY(1)";
                      setHoveredBar(null);
                    }}
                  >
                    {/* Label inset on left */}
                    <div
                      style={{
                        fontSize: "14px",
                        color: "#ffffff",
                        fontWeight: "500",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: showValueOutside ? "90%" : "60%",
                        paddingLeft: "5px",
                        userSelect: "none",
                      }}
                      title={`${label}: ${formatValue(value)}`}
                    >
                      {label}
                    </div>

                    {/* Value inset on right (only when bar is wide enough) */}
                    {!showValueOutside && (
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#ffffff",
                          fontWeight: "500",
                          flexShrink: 0,
                          textAlign: "right",
                          paddingRight: "5px",
                        }}
                      >
                        {formatValue(value)}
                      </div>
                    )}
                  </div>

                  {/* Value outside bar (when bar is narrow) */}
                  {showValueOutside && (
                    <div
                      style={{
                        position: "absolute",
                        left: `${barWidth}%`,
                        top: "50%",
                        transform: "translateY(-50%)",
                        fontSize: "12px",
                        color: "#374151",
                        fontWeight: "500",
                        paddingLeft: "8px",
                        pointerEvents: "none",
                      }}
                    >
                      {formatValue(value)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Loading indicator at bottom */}
        {isLoading && (
          <div
            style={{
              position: "absolute",
              bottom: "0",
              left: "0",
              right: "0",
              height: "30px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              fontSize: "12px",
              color: "#6b7280",
            }}
          >
            Loading more...
          </div>
        )}
      </div>

      {/* Tooltip */}
      {hoveredBar && tooltipData[hoveredBar] && (
        <div
          style={{
            position: "fixed",
            left: `${tooltipPosition.x + 10}px`,
            top: `${tooltipPosition.y - 10}px`,
            backgroundColor: "rgba(0, 0, 0, 0.9)",
            color: "#ffffff",
            padding: "8px 12px",
            borderRadius: "6px",
            fontSize: "12px",
            pointerEvents: "none",
            zIndex: 1000,
            maxWidth: "300px",
            wordWrap: "break-word",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          }}
        >
          {tooltipData[hoveredBar]}
        </div>
      )}
    </div>
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
