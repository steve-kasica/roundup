import PropTypes from "prop-types";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Typography,
  Checkbox,
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
  totalMatches,
  matchType,
}) {
  const getSectionColor = () => {
    switch (matchType) {
      case "single":
        return "#4CAF50";
      case "none":
        return "#f44336";
      case "many":
        return "#FF9800";
      default:
        return "#000";
    }
  };

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
  const isDisabled = matches.length === 0;

  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        color={getSectionColor()}
        disabled={isDisabled}
        sx={{
          "& .MuiAccordionSummary-content": {
            alignItems: "center",
          },
        }}
      >
        <Checkbox
          size="small"
          defaultChecked={!isDisabled}
          sx={{ mr: 1 }}
          onClick={(e) => e.stopPropagation()} // Prevent accordion toggle when clicking checkbox
        />
        <Typography
          component="span"
          sx={{ width: `${marginLeft * 100}%`, flexShrink: 0 }}
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
              background: getSectionColor(),
              height: "100%",
              width: `${percentage * 100}%`,
              textAlign: "right",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              fontWeight: "bold",
              fontSize: "12px",
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
      </AccordionSummary>
      <AccordionDetails>
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
                      getSectionColor={getSectionColor}
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
                            barColor={getSectionColor()}
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
                        barColor={getSectionColor()}
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
  matches: PropTypes.array.isRequired,
  totalMatches: PropTypes.number.isRequired,
  matchType: PropTypes.oneOf(["single", "none", "many", "unmatched"])
    .isRequired,
};

export default MatchSection;
