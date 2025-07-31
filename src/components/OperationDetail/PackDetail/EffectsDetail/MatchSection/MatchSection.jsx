import PropTypes from "prop-types";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { extent, max, scaleLinear } from "d3";
import ConnectionLine from "./ConnectionLine";
import ValueView from "./ValueView";

function MatchSection({
  title = "Matches",
  leftTitle = "Column 1",
  rightTitle = "Column 2",
  matches,
  totalMatches,
  matchType,
}) {
  const itemHeight = 59.93; // in pixels
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

  const xScale = scaleLinear()
    .domain([
      0,
      max(
        matches,
        ([{ count }, matchValues]) =>
          count * max(matchValues, ({ count }) => count)
      ),
    ])
    .range([0, 1]);

  const getContainerHeight = (matches) => {
    if (matchType === "many") {
      return `${matches.length * itemHeight + (matches.length - 1) * 4}px`;
    }
    return itemHeight + "px";
  };

  const getAlignItems = () => {
    return matchType === "many" ? "flex-start" : "center";
  };

  const getHoverColor = () => {
    switch (matchType) {
      case "single":
        return "#45a049";
      case "none":
        return "#d32f2f";
      case "many":
        return "#f57c00";
      default:
        return "#333";
    }
  };
  const marginLeft = 0.3; // as a percentage of the width for the AccordionSummary
  const percentage = matches.length / totalMatches; // [0,1]

  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        color={getSectionColor()}
        disabled={matches.length === 0}
        hoverColor={getHoverColor()}
      >
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
              marginBottom: "16px",
              padding: "8px 0",
              borderBottom: "1px solid #ddd",
            }}
          >
            <div style={{ flex: 1, fontWeight: "bold" }}>{leftTitle}</div>
            <div style={{ flex: 1, textAlign: "center" }}></div>
            <div style={{ flex: 1, fontWeight: "bold" }}>{rightTitle}</div>
            <div style={{ flex: 1, fontWeight: "bold" }}>Row Count</div>
          </div>

          <div style={{ height: "300px", overflowY: "auto" }}>
            {matches.map(
              ([{ value: leftValue, count: leftCount }, matchValues]) => (
                <div
                  style={{
                    display: "flex",
                    alignItems: getAlignItems(),
                    textAlign: "center",
                    marginBottom: "8px",
                    position: "relative",
                  }}
                  key={leftValue}
                >
                  <ValueView value={leftValue} matchCount={leftCount} />
                  <div
                    style={{
                      flex: 0.3, // Reduced from flex: 1 to give less space
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: getContainerHeight(matchValues || []),
                      minWidth: "10px", // Ensure minimum width for connections
                    }}
                  >
                    <ConnectionLine
                      matchType={matchType}
                      matchValues={matchValues}
                      getSectionColor={getSectionColor}
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
                    {matchValues.map(
                      ({ value: rightValue, count: rightCount }) => (
                        <ValueView
                          key={rightValue}
                          value={rightValue}
                          matchCount={rightCount}
                        />
                      )
                    )}
                  </div>
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                    }}
                  >
                    {matchValues.map(
                      ({ value: rightValue, count: rightCount }) => (
                        <Box
                          key={rightValue}
                          sx={{
                            width: `${xScale(leftCount * rightCount) * 100}%`,
                            height: itemHeight + "px",
                            backgroundColor: getSectionColor(),
                            opacity: 0.7,
                            textAlign: "right",
                          }}
                        >
                          {leftCount * rightCount}
                        </Box>
                      )
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
  matchType: PropTypes.oneOf(["single", "none", "many"]).isRequired,
};

export default MatchSection;
