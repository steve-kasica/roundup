/**
 * @fileoverview ValueCountUpset Component
 *
 * Renders an UpSet plot-style visualization for comparing unique values across multiple
 * columns. This component displays a matrix where each row represents a unique value and
 * each column represents a parent table/operation. Circle marks indicate the presence of
 * values, and connecting lines show which combinations of columns share specific values.
 *
 * The UpSet plot is particularly effective for visualizing set intersections and is
 * superior to Venn diagrams when comparing more than 3 sets. This implementation includes
 * interactive features like scrollable content and ref-based navigation.
 *
 * @module components/ColumnValuesComparison/ValueCountUpset
 *
 * @example
 * <ValueCountUpset
 *   signatures={['101', '110', '011']}
 *   data={[[5, 0, 3], [2, 4, 0]]}
 *   uniqueValues={['value1', 'value2']}
 *   valueDegrees={[2, 2]}
 *   parentIds={['table1', 'table2', 'table3']}
 *   rowHeight={32}
 *   yAxisWidth={100}
 *   valueRowRefs={valueRefs}
 *   bodyRef={containerRef}
 * />
 */

import { Box } from "@mui/material";
import { extent, scaleLinear } from "d3";
import { useMemo } from "react";
import { isTableId } from "../../slices/tablesSlice";
import { EnhancedTableName } from "../TableView/TableName";

/**
 * ValueCountUpset Component
 *
 * An UpSet plot visualization showing the distribution and overlap of unique values
 * across multiple columns/tables.
 *
 * @component
 * @param {Object} props - Component props
 * @param {string[]} props.signatures - Binary signatures indicating value presence (e.g., '101' means present in columns 0 and 2)
 * @param {number[][]} [props.data=[]] - 2D array of value counts, rows are values, columns are parents
 * @param {string[]} [props.uniqueValues=[]] - Array of unique value strings for row labels
 * @param {number[]} [props.valueDegrees=[]] - Array indicating how many columns each value appears in
 * @param {string[]} [props.parentIds=[]] - Array of parent IDs (table or operation IDs) for column headers
 * @param {number} [props.rowHeight=32] - Height in pixels for each value row
 * @param {number} [props.yAxisWidth=100] - Width in pixels for the y-axis label area
 * @param {React.MutableRefObject} props.valueRowRefs - Ref array for accessing individual row elements
 * @param {React.MutableRefObject} props.bodyRef - Ref for the scrollable body container
 *
 * @returns {React.ReactElement} A scrollable matrix visualization with column headers and value rows
 *
 * @description
 * Visual elements:
 * - Column headers display table/operation names
 * - Each row shows a unique value with circle marks indicating presence
 * - Horizontal lines connect circles for values appearing in multiple columns
 * - Rows are scrollable with ref-based navigation support
 * - Circle marks use color coding (black for present, gray for absent)
 */
const ValueCountUpset = ({
  signatures,
  data = [],
  uniqueValues = [],
  valueDegrees = [],
  parentIds = [],
  rowHeight = 32,
  yAxisWidth = 100,
  valueRowRefs,
  bodyRef,
}) => {
  const colWidth = useMemo(
    () => (1 / parentIds.length) * 100 + "%",
    [parentIds.length]
  );
  const signatureExtent = useMemo(
    () =>
      signatures.map((sig) =>
        extent(
          sig
            .split("")
            .map((v, i) => [Number(v), i])
            .filter(([b]) => b)
            .map(([, i]) => i)
        )
      ),
    [signatures]
  );
  const colorScale = (value) => {
    if (value === 0) return "#aaa";
    return "#000";
  };

  return (
    <Box display="flex" flexDirection="column" sx={{ mt: 2 }}>
      {/* x-axis labels, columns or tables */}
      <Box
        display="flex"
        justifyContent={"space-around"}
        sx={{ flex: 1, height: "30px" }}
      >
        <Box
          sx={{
            width: `${yAxisWidth}px`,
            padding: "4px",
            textAlign: "right",
            boxSizing: "border-box",
          }}
        ></Box>
        <Box
          display="flex"
          flex="1"
          sx={{
            borderBottom: "1px solid #ccc",
          }}
        >
          {parentIds.map((parentId) =>
            isTableId(parentId) ? (
              <EnhancedTableName
                key={parentId}
                id={parentId}
                sx={{
                  width: `${colWidth}`,
                  textAlign: "center",
                }}
              />
            ) : (
              "TODO"
              // <EnhancedOperationOutputTableName
              //   key={parentId}
              //   operationId={parentId}
              // />
            )
          )}
        </Box>
      </Box>
      <Box
        ref={bodyRef}
        sx={{
          overflowY: "auto",
          maxHeight: "100vh",
        }}
      >
        {data.map((row, i) => (
          <Box
            key={i}
            sx={{
              display: "flex",
              flexDirection: "row",
              borderBottom: "1px solid #eee",
              height: `${rowHeight}px`,
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box
              title={uniqueValues[i]}
              ref={(el) => (valueRowRefs.current[i] = el)}
              sx={{
                width: `${yAxisWidth}px`,
                padding: "4px",
                textAlign: "right",
                boxSizing: "border-box",
                overflow: "hidden",
                textOverflow: "ellipsis",
                userSelect: "none",
              }}
            >
              {uniqueValues[i]}
            </Box>
            <Box display="flex" flex="1">
              {row.map((count, j) => (
                <Box
                  key={j}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    width: colWidth,
                    padding: "4px",
                    textAlign: "center",
                    borderLeft: "none",
                    boxSizing: "border-box",
                    position: "relative",
                    "&::after":
                      valueDegrees[i] > 1
                        ? {
                            content: '""',
                            position: "absolute",
                            top: "45%",
                            left:
                              j > signatureExtent[i][0] &&
                              j <= signatureExtent[i][1]
                                ? "0"
                                : "50%",
                            right:
                              j >= signatureExtent[i][0] &&
                              j < signatureExtent[i][1]
                                ? "0"
                                : "50%",
                            height: "2px",
                            backgroundColor: "black",
                            // transform: "translateY(-50%)",
                            zIndex: 1,
                          }
                        : {},
                  }}
                >
                  <CircleMark
                    backgroundColor={colorScale(count)}
                    strokeColor={colorScale(count)}
                    value={count}
                  />
                </Box>
              ))}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

/**
 * CircleMark Component
 *
 * Renders a circular mark used in the UpSet plot to indicate the presence of a value
 * in a specific column. The circle's appearance can be customized with colors.
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.backgroundColor="#000"] - Fill color for the circle
 * @param {number} [props.size=13] - Diameter of the circle in pixels
 * @param {string} [props.strokeColor="#000"] - Border color for the circle
 * @param {number|string} props.value - Value to display in the title tooltip
 *
 * @returns {React.ReactElement} A circular mark element
 *
 * @private
 */
function CircleMark({
  backgroundColor = "#000",
  size = 13,
  strokeColor = "#000",
  value,
}) {
  return (
    <Box
      title={value}
      sx={{
        borderRadius: "50%",
        border: `1px solid ${strokeColor}`,
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor,
        display: "inline-block",
        margin: "0 auto",
      }}
    ></Box>
  );
}
export default ValueCountUpset;
