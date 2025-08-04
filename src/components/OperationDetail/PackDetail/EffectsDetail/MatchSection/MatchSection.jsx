import PropTypes from "prop-types";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Typography,
  Checkbox,
  Stack,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { max, scaleLinear } from "d3";
import ConnectionLine from "./ConnectionLine";
import ValueView from "./ValueView";
import Bar from "./Bar";

const columnWidths = ["30%", "10%", "30%", "30%"];
const itemHeight = 12; // in pixels

function MatchSection({
  title = "Matches",
  leftTitle = "Column 1",
  rightTitle = "Column 2",
  matches,
  barColor = "gray",
  fontSize = "12px",
  totalMatches,
  matchType,
}) {
  // leftCount is zero in the unmatched case, so we use Math.max(1, leftCount)
  // to ensure the bar is calculated correctly, i.e. > 0
  const xScale = scaleLinear()
    .domain([
      0,
      max(
        matches,
        ([{ count: leftCount }, matchValues]) =>
          Math.max(1, leftCount) *
          (matchValues.length > 0
            ? max(matchValues, ({ count: rightCount }) => rightCount)
            : 1)
      ),
    ])
    .range([0, 1]);

  const getAlignItems = () => {
    return matchType === "many" ? "flex-start" : "center";
  };

  const marginLeft = 0.3; // as a percentage of the width for the AccordionSummary
  const percentage = matches.length / totalMatches; // [0,1]
  console.log(percentage, "percentages");
  const isDisabled = matches.length === 0;

  return (
    <Accordion
      sx={{
        boxShadow: "none",
        "&:before": {
          display: "none", // Removes the divider line
        },
      }}
      disableGutters
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        color={barColor}
        disabled={isDisabled}
        sx={{
          "& .MuiAccordionSummary-content": {
            alignItems: "center",
            margin: 0,
          },
          padding: 0,
          minHeight: "5px",
        }}
      >
        <Typography
          component="span"
          sx={{
            width: `${marginLeft * 100}%`,
            flexShrink: 0,
            textAlign: "right",
            paddingRight: "8px",
            fontSize,
          }}
        >
          {title}
        </Typography>
        <Box
          sx={{
            background: "#ddd",
            width: `${(1 - marginLeft) * 100}%`,
          }}
        >
          <Box
            sx={{
              background: barColor,
              height: "100%",
              width: `${percentage * 100}%`,
              textAlign: "right",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              fontWeight: "bold",
              fontSize,
              overflow: "visible",
            }}
          >
            <span
              style={{
                position: "relative",
                right: percentage < 0.5 ? "-2.5ch" : "0px",
                color: percentage < 0.5 ? "black" : "white",
                paddingRight: percentage < 0.5 ? "0px" : "1ch",
              }}
            >
              {matches.length}
            </span>
          </Box>
        </Box>
        <Checkbox
          size="small"
          defaultChecked={!isDisabled}
          sx={{ margin: 0, padding: 0 }}
          onClick={(e) => e.stopPropagation()} // Prevent accordion toggle when clicking checkbox
        />
      </AccordionSummary>
      <AccordionDetails
        sx={{
          backgroundColor: "#f8f9fa",
          border: "1px solid #dee2e6",
          borderRadius: "4px",
          boxShadow: "inset 0 1px 3px rgba(0, 0, 0, 0.1)",
          padding: "16px",
          margin: "8px 0",
        }}
      >
        <>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              textAlign: "center",
              fontWeight: "bold",
              marginBottom: "16px",
              padding: "8px 0",
              borderBottom: "1px solid #ddd",
            }}
          >
            <div style={{ flex: 1, fontWeight: "bold", textAlign: "center" }}>
              {leftTitle}
            </div>
            <div style={{ flex: 0.3, textAlign: "center" }}></div>
            <div style={{ flex: 1, fontWeight: "bold" }}>{rightTitle}</div>
            <div style={{ width: columnWidths[3], fontWeight: "bold" }}>
              Row Count
            </div>
          </div>

          <div style={{ height: "300px", overflowY: "auto" }}>
            {matches.map(
              ([{ value: leftValue, count: leftCount }, matchValues]) => (
                <div
                  style={{
                    display: "flex",
                    flex: 1,
                    alignItems: getAlignItems(),
                    textAlign: "center",
                    marginBottom: "8px",
                    position: "relative",
                  }}
                  key={leftValue}
                >
                  <div style={{ flex: 1, maxWidth: "40%" }}>
                    <ValueView
                      value={leftValue}
                      matchCount={leftCount}
                      height={itemHeight}
                    />
                  </div>
                  <div
                    style={{
                      position: "relative",
                      display: "flex",
                      flex: 0.3,
                      alignItems: "center",
                      justifyContent: "center",
                      height:
                        Math.max(1, matchValues.length) * 30 +
                        4 * (Math.max(1, matchValues.length) - 1),
                      minWidth: "10px",
                    }}
                  >
                    <ConnectionLine
                      matchType={matchType}
                      matchValues={matchValues}
                      strokeColor={barColor}
                      itemHeight={itemHeight + 2 * 8 + 2 * 1}
                    />
                  </div>
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                    }}
                  >
                    {matchValues.length > 0 ? (
                      matchValues.map(
                        ({ value: rightValue, count: rightCount }) => (
                          <ValueView
                            key={rightValue}
                            value={rightValue}
                            matchCount={rightCount}
                            height={itemHeight}
                          />
                        )
                      )
                    ) : (
                      <ValueView height={itemHeight} />
                    )}
                  </div>
                  <div
                    style={{
                      width: columnWidths[3],
                      display: "flex",
                      flexDirection: "column",
                      paddingLeft: "5px",
                      gap: "4px",
                    }}
                  >
                    {matchValues.length > 0 ? (
                      matchValues.map(
                        ({ value: rightValue, count: rightCount }) => (
                          <Bar
                            key={rightValue}
                            // leftCount equals zero in the unmatched case, so we use Math.max(1, leftCount)
                            value={Math.max(1, leftCount) * rightCount}
                            width={
                              xScale(Math.max(1, leftCount) * rightCount) * 100
                            }
                            height={itemHeight + 8 * 2}
                            barColor={barColor}
                            opacity={0.7}
                            textAlign="right"
                          />
                        )
                      )
                    ) : (
                      <Bar
                        value={leftCount}
                        width={xScale(leftCount) * 100}
                        height={itemHeight + 8 * 2}
                        barColor={barColor}
                        opacity={0.7}
                      />
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        </>
      </AccordionDetails>
    </Accordion>
  );
}

MatchSection.propTypes = {
  title: PropTypes.string,
  leftTitle: PropTypes.string,
  rightTitle: PropTypes.string,
  barColor: PropTypes.string,
  fontSize: PropTypes.string,
  matches: PropTypes.array.isRequired,
  totalMatches: PropTypes.number.isRequired,
  matchType: PropTypes.oneOf(["single", "none", "many", "unmatched"])
    .isRequired,
};

export default MatchSection;
