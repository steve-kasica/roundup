import { Box, styled } from "@mui/material";

const StyledBlockCell = styled(Box, {
  shouldForwardProp: (prop) =>
    ![
      "isClicked",
      "disabled",
      "isLastLeftColumn",
      "showTopBorder",
      "showBottomBorder",
      "showLeftBorder",
      "showRightBorder",
      "borderWidth",
      "backgroundColor",
    ].includes(prop),
})(
  ({
    theme,
    isClicked,
    disabled,
    isLastLeftColumn,
    showTopBorder,
    showBottomBorder,
    showLeftBorder,
    showRightBorder,
    borderWidth,
    backgroundColor,
  }) => {
    const shadows = [];

    // Always show a subtle separator on the right
    shadows.push("inset -1px 0 0 0 rgba(0, 0, 0, 0.05)");

    // Add selection borders (these will overlay on top of separator)
    if (isClicked) {
      if (showTopBorder) {
        shadows.push(
          `inset 0 ${borderWidth} 0 0 ${theme.palette.primary.main}`
        );
      }
      if (showBottomBorder) {
        shadows.push(
          `inset 0 -${borderWidth} 0 0 ${theme.palette.primary.main}`
        );
      }
      if (showLeftBorder) {
        shadows.push(
          `inset ${borderWidth} 0 0 0 ${theme.palette.primary.main}`
        );
      }
      if (showRightBorder) {
        shadows.push(
          `inset -${borderWidth} 0 0 0 ${theme.palette.primary.main}`
        );
      }
    }

    return {
      flex: 1,
      minWidth: 0,
      height: "100%",
      backgroundColor,
      position: "relative",
      boxShadow: shadows.join(", "),
      ...(isClicked && {
        opacity: 0.8,
      }),
      ...(disabled && {
        backgroundColor: theme.palette.grey[300],
        cursor: "not-allowed",
      }),
      ...(isLastLeftColumn && {
        marginRight: "4px",
      }),
      "&:hover": {
        opacity: disabled ? 1 : 0.8,
      },
    };
  }
);

export default StyledBlockCell;
