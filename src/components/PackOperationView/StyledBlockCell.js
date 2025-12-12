import { Box, styled } from "@mui/material";

const StyledBlockCell = styled(Box, {
  shouldForwardProp: (prop) =>
    ![
      "disabled",
      "isEmpty",
      "isLastLeftColumn",
      "highlightTopBorder",
      "highlightBottomBorder",
      "highlightLeftBorder",
      "highlightRightBorder",
      "borderWidth",
      "backgroundColor",
    ].includes(prop),
})(
  ({
    theme,
    disabled,
    isEmpty,
    isLastLeftColumn,
    highlightTopBorder,
    highlightBottomBorder,
    highlightLeftBorder,
    highlightRightBorder,
    borderWidth = 1, // in pixels
    backgroundColor,
  }) => {
    const borderColor = theme.palette.primary.main;
    const defaultBorderColor = "rgba(0, 0, 255, 0.05)";
    const isSelected =
      highlightTopBorder ||
      highlightBottomBorder ||
      highlightLeftBorder ||
      highlightRightBorder;

    return {
      flex: 1,
      minWidth: 0,
      height: "100%",
      backgroundColor,
      opacity: 0.75,
      position: "relative",
      boxShadow: `
      inset 0 ${borderWidth}px 0 0 ${
        highlightTopBorder ? borderColor : defaultBorderColor
      },
      inset 0 -${borderWidth}px 0 0 ${
        highlightBottomBorder ? borderColor : defaultBorderColor
      },
      inset ${borderWidth}px 0 0 0 ${
        highlightLeftBorder ? borderColor : defaultBorderColor
      },
      inset -${isLastLeftColumn ? borderWidth * 3 : borderWidth}px 0 0 0 ${
        highlightRightBorder ? borderColor : defaultBorderColor
      }
      `,
      transition: "box-shadow 0.2s ease, opacity 0.2s ease",
      ...(isEmpty && {
        backgroundImage: `repeating-linear-gradient(
        45deg,
        ${theme.palette.grey[100]},
        ${theme.palette.grey[100]} 10px,
        ${backgroundColor} 10px,
        ${backgroundColor} 20px
      )`,
        backgroundColor: "transparent",
      }),
      ...(disabled && {
        backgroundColor: theme.palette.grey[200],
        cursor: "not-allowed",
      }),
      "&:hover": {
        opacity: disabled ? 1 : 0.8,
      },
      ...(isSelected && {
        opacity: 1,
      }),
    };
  }
);

export default StyledBlockCell;
