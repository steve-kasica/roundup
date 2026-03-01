import { Typography } from "@mui/material";

const HEIGHT_BREAKPOINTS = {
  SMALL: 15,
  MEDIUM: 30,
  LARGE: 45,
};

const BlockLabel = ({ primaryText, secondaryText }) => {
  return (
    <>
      <Typography
        variant="data-small"
        sx={{
          // Inherit color to adapt to background changes
          color: "inherit",
          fontWeight: "bold",
          position: "absolute",
          top: 4,
          left: 4,
          textAlign: "left",
          whiteSpace: "nowrap",
          wordBreak: "keep-all",
          [`@container (max-height: ${HEIGHT_BREAKPOINTS.SMALL}px)`]: {
            display: "none",
          },
        }}
      >
        {primaryText}
      </Typography>
      <Typography
        variant="data-small"
        component="small"
        sx={{
          position: "absolute",
          top: 15,
          left: 4,
          whiteSpace: "nowrap",
          color: "inherit",
          wordBreak: "keep-all",
          [`@container (max-height: ${HEIGHT_BREAKPOINTS.MEDIUM}px)`]: {
            display: "none",
          },
        }}
      >
        {secondaryText}
      </Typography>
    </>
  );
};

BlockLabel.displayName = "BlockLabel";

export default BlockLabel;
