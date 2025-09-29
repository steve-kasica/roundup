import { Box, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import PropTypes from "prop-types";

const StyledStatisticsBar = styled(Box)(
  ({ theme, variant = "gray", clickable = false }) => {
    const getColorScheme = () => {
      switch (variant) {
        case "success":
          return {
            backgroundColor: theme.palette.success.light,
            color: theme.palette.success.contrastText,
          };
        case "error":
          return {
            backgroundColor: theme.palette.error.light,
            color: theme.palette.error.contrastText,
          };
        case "warning":
          return {
            backgroundColor: theme.palette.warning.light,
            color: theme.palette.warning.contrastText,
          };
        case "empty":
          return {
            backgroundColor: "transparent",
            color: "#000",
            outline: "2px dashed #ddd",
          };
        case "gray":
          return {
            backgroundColor: theme.palette.grey[300],
            color: theme.palette.grey[800],
          };
        default:
          return {
            backgroundColor: theme.palette.grey[300],
            color: theme.palette.grey[800],
          };
      }
    };

    const colors = getColorScheme();

    return {
      width: "100%",
      borderRadius: theme.spacing(1),
      textAlign: "center",
      fontWeight: "bold",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      cursor: clickable ? "pointer" : "default",
      ...colors,
    };
  }
);

/**
 * A reusable statistics bar component for displaying match statistics
 * @param {Object} props
 * @param {string} props.height - CSS height value (e.g., "40%", "50px")
 * @param {string} props.minHeight - CSS minHeight value (optional)
 * @param {string} props.variant - Color variant: "success", "error", "warning", "empty", or "gray"
 * @param {boolean} props.clickable - Whether the bar should have a pointer cursor
 * @param {string} props.label - The text label to display
 * @param {React.ReactNode} props.children - Alternative to label for custom content
 * @param {Object} props.sx - Additional sx props to override styles
 */
const StatisticsBar = ({
  height,
  minHeight,
  variant = "gray",
  clickable = false,
  label,
  children,
  sx,
  ...other
}) => {
  // Hide the component if height is 0%
  const shouldHide = height === "0%" || height === "0";

  return (
    <StyledStatisticsBar
      variant={variant}
      clickable={clickable}
      sx={{
        height,
        minHeight,
        display: shouldHide ? "none" : undefined,
        ...sx,
      }}
      {...other}
    >
      {children || <Typography variant="body2">{label}</Typography>}
    </StyledStatisticsBar>
  );
};

StatisticsBar.propTypes = {
  height: PropTypes.string,
  minHeight: PropTypes.string,
  variant: PropTypes.oneOf(["success", "error", "warning", "empty", "gray"]),
  clickable: PropTypes.bool,
  label: PropTypes.string,
  children: PropTypes.node,
  sx: PropTypes.object,
};

export default StatisticsBar;
