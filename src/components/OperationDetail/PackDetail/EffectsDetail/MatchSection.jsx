import PropTypes from "prop-types";
import { Chip } from "@mui/material";

function MatchSection({ title, matches, matchType, chipHeight }) {
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

  const renderConnection = (matches, index = 0) => {
    const color = getSectionColor();

    if (matchType === "many") {
      const totalHeight = matches.length * 32 + (matches.length - 1) * 4;
      const startY = (16 / totalHeight) * 100;
      const endY = ((index + 0.5) / matches.length) * 100;
      const controlPoint1X = 30;
      const controlPoint2X = 70;

      return (
        <path
          key={index}
          d={`M 0 ${startY} C ${controlPoint1X} ${startY}, ${controlPoint2X} ${endY}, 100 ${endY}`}
          stroke={color}
          strokeWidth="2"
          fill="none"
          opacity="0.6"
        />
      );
    } else {
      return (
        <path
          d="M 0 50 L 100 50"
          stroke={color}
          strokeWidth="5"
          fill="none"
          opacity="0.6"
        />
      );
    }
  };

  const getContainerHeight = (matches) => {
    if (matchType === "many") {
      return `${matches.length * 32 + (matches.length - 1) * 4}px`;
    }
    return chipHeight;
  };

  const getAlignItems = () => {
    return matchType === "many" ? "flex-start" : "center";
  };

  return (
    <>
      <h2>{title}</h2>
      <div style={{ height: "300px", overflowY: "auto" }}>
        {matches.map(([value, matchValues]) => (
          <div
            style={{
              display: "flex",
              alignItems: getAlignItems(),
              textAlign: "center",
              marginBottom: "8px",
              position: "relative",
            }}
            key={value}
          >
            <Chip
              label={value}
              variant="outlined"
              sx={{
                flex: 1,
                position: "relative",
                height: chipHeight,
              }}
            />
            <div
              style={{
                flex: 1,
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: getContainerHeight(matchValues || []),
              }}
            >
              <svg
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  pointerEvents: "none",
                }}
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                {matchType === "many"
                  ? matchValues.map((_, index) =>
                      renderConnection(matchValues, index)
                    )
                  : renderConnection()}
              </svg>
            </div>

            {matchType === "many" ? (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                {matchValues.map((match) => (
                  <Chip
                    key={match}
                    label={match}
                    variant="outlined"
                    sx={{ height: chipHeight }}
                  />
                ))}
              </div>
            ) : (
              <Chip
                label={
                  matchType === "none" ? <em>no match</em> : matchValues?.[0]
                }
                variant="outlined"
                sx={{
                  flex: 1,
                  position: "relative",
                  height: chipHeight,
                }}
              />
            )}
          </div>
        ))}
      </div>
    </>
  );
}

MatchSection.propTypes = {
  title: PropTypes.string.isRequired,
  matches: PropTypes.array.isRequired,
  matchType: PropTypes.oneOf(["single", "none", "many"]).isRequired,
  chipHeight: PropTypes.string.isRequired,
};

export default MatchSection;
