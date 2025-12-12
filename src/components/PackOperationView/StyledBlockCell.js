import { Box, lighten, styled } from "@mui/material";

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
    tableBorderWidth = 2, // in pixels
    defaultBorderColor = "rgba(0, 0, 255, 0.05)",
    backgroundColor,
  }) => {
    const selectedBorderColor = theme.palette.primary.main;
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
      paddingRight: isLastLeftColumn ? tableBorderWidth : 0,
      boxShadow: `
      inset 0 ${borderWidth}px 0 0 ${
        highlightTopBorder ? selectedBorderColor : defaultBorderColor
      },
      inset 0 -${borderWidth}px 0 0 ${
        highlightBottomBorder ? selectedBorderColor : defaultBorderColor
      },
      inset ${borderWidth}px 0 0 0 ${
        highlightLeftBorder ? selectedBorderColor : defaultBorderColor
      },
      inset -${isLastLeftColumn ? tableBorderWidth : borderWidth}px 0 0 0 ${
        highlightRightBorder ? selectedBorderColor : defaultBorderColor
      }
      `,
      transition: "box-shadow 0.2s ease, opacity 0.2s ease",
      ...(isEmpty && {
        backgroundColor: lighten(backgroundColor, 0.75),
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
