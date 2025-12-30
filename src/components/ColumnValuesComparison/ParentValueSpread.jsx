/**
 * @fileoverview ParentValueSpread Component
 *
 * Displays a horizontal bar chart showing the distribution of unique values across
 * different column categories (all columns, some columns, one column). Each category
 * is represented by a bar whose width corresponds to the proportion of values in that
 * category relative to the total unique value count.
 *
 * The component provides interactive functionality, allowing users to click on category
 * labels to scroll to the corresponding values in the main value matrix view.
 *
 * @module components/ColumnValuesComparison/ParentValueSpread
 *
 * @example
 * <ParentValueSpread
 *   categories={{
 *     all: { label: "all columns", count: 50, firstIndex: 0 },
 *     some: { label: "some columns", count: 30, firstIndex: 50 },
 *     one: { label: "one column", count: 20, firstIndex: 80 }
 *   }}
 *   valueCount={100}
 *   scrollToDegree={(index) => console.log(index)}
 *   loading={false}
 * />
 */

import { Typography, Box, Skeleton } from "@mui/material";

/**
 * ParentValueSpread Component
 *
 * Renders a visual distribution chart showing how unique values are spread across
 * different column categories with interactive scrolling capabilities.
 *
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.categories - Category definitions with counts and indices
 * @param {Object} props.categories.all - Values appearing in all columns
 * @param {string} props.categories.all.label - Display label for the category
 * @param {number} props.categories.all.count - Number of values in this category
 * @param {number} props.categories.all.firstIndex - Index of first value in this category
 * @param {Object} props.categories.some - Values appearing in some columns
 * @param {Object} props.categories.one - Values appearing in one column only
 * @param {number} props.valueCount - Total number of unique values across all categories
 * @param {Function} props.scrollToDegree - Callback function to scroll to a specific index in the value matrix
 * @param {boolean} [props.loading=true] - Loading state indicator, shows skeleton when true
 *
 * @returns {React.ReactElement} A box containing horizontal bar charts for each category
 *
 * @description
 * Visual features:
 * - Bars are proportionally sized based on value count
 * - Categories with 0 values are grayed out
 * - Click interaction on labels triggers scrolling to corresponding values
 * - Loading state displays skeleton placeholders
 * - Shows count values at the end of each bar
 */
const ParentValueSpread = ({
  categories,
  valueCount,
  scrollToDegree,
  loading = true,
}) => {
  return (
    <Box>
      <Box
        sx={{
          minWidth: "90px",
          marginRight: "8px",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          alignItems: "flex-start",
        }}
      >
        {Object.entries(categories).map(
          ([key, { label, count, firstIndex }]) => (
            <Box
              key={key}
              sx={{
                position: "relative",
                display: "flex",
                flexDirection: "row",
                width: "100%",
                alignItems: "center",
                color: count > 0 ? "#333" : "#aaa",
                padding: "2px 8px",
                fontSize: "0.75em",
                height: "15px",
                lineHeight: "15px",
              }}
              title={`Click to scroll to values in ${label}`}
            >
              <Box
                className="label"
                onClick={() => {
                  // Scroll to the first index of this category
                  scrollToDegree(firstIndex);
                }}
                sx={{
                  width: "100px",
                  textAlign: "right",
                  cursor: "pointer",
                }}
              >
                <Typography
                  component="span"
                  sx={{
                    fontSize: "1em",
                    fontWeight: "bold",
                    textTransform: "capitalize",
                    whiteSpace: "nowrap",
                    paddingRight: "15px",
                  }}
                >
                  {label}
                </Typography>
              </Box>
              <style>
                {`
                        .bar-container::before {
                        content: "—";
                        position: absolute;
                        margin-left: -10px;
                        margin-top: 3px;
                        ;}
                        `}
              </style>
              <Box
                className="bar-container"
                sx={{
                  flex: 1,
                }}
              >
                {loading ? (
                  <Skeleton
                    component="div"
                    width="100%"
                    minWidth="1px"
                    animation="wave"
                    sx={{
                      borderRadius: 0,
                      textAlign: "right",
                    }}
                  >
                    <Typography
                      component="span"
                      sx={{
                        position: "relative",
                        fontSize: "1em",
                        zIndex: 1,
                        paddingLeft: "4px",
                        whiteSpace: "nowrap",
                        lineHeight: "20px",
                        paddingRight: "5px",
                      }}
                    >
                      <small>??</small>
                    </Typography>
                  </Skeleton>
                ) : (
                  <Box
                    className="bar"
                    sx={{
                      background: "#e0e0e0",
                      width: `${(count / valueCount) * 100}%`,
                      minWidth: "1px",
                      textAlign: "right",
                    }}
                  >
                    <Typography
                      component="span"
                      sx={{
                        position: "relative",
                        fontSize: "1em",
                        zIndex: 1,
                        paddingLeft: "4px",
                        whiteSpace: "nowrap",
                        lineHeight: "20px",
                        paddingRight: "5px",
                      }}
                    >
                      <small>{count.toLocaleString()}</small>
                    </Typography>
                  </Box>
                )}
              </Box>
              {/* <span sx={{ color: "#888" }}>({count})</span> */}
            </Box>
          )
        )}
      </Box>
    </Box>
  );
};
export default ParentValueSpread;
