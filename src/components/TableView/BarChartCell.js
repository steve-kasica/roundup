import { styled, Typography } from "@mui/material";

const BarChartCell = styled(Typography, {
  shouldForwardProp: (prop) => !["percentage", "isDisabled"].includes(prop),
})(({ percentage, isDisabled }) => ({
  position: "relative",
  backgroundImage: `linear-gradient(to right, ${
    isDisabled ? "rgba(0, 0, 0, 0.05)" : "rgba(25, 118, 210, 0.15)"
  } 0%, ${
    isDisabled ? "rgba(0, 0, 0, 0.05)" : "rgba(25, 118, 210, 0.15)"
  } ${percentage.toFixed(1)}%, transparent ${percentage.toFixed(1)}%)`,
  backgroundRepeat: "no-repeat",
  backgroundSize: "100% 100%",
  borderRight: "2px solid transparent",
  textWrap: "nowrap",
  borderTop: "2px solid transparent",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `linear-gradient(to right, ${
      isDisabled ? "rgba(0, 0, 0, 0.08)" : "rgba(25, 118, 210, 0.2)"
    } 0%, ${
      isDisabled ? "rgba(0, 0, 0, 0.08)" : "rgba(25, 118, 210, 0.2)"
    } ${percentage.toFixed(1)}%, transparent ${percentage.toFixed(1)}%)`,
    zIndex: -1,
    borderRadius: "2px",
  },
}));

export default BarChartCell;
