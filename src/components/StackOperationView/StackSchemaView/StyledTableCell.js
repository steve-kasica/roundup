import { styled } from "@mui/material/styles";
import TableCell from "@mui/material/TableCell";

const borderWidth = 1;
const borderHighlightColor = "#1976d2";
const defaultBorderColor = "rgba(0, 0, 0, 0.12)";

const StyledTableCell = styled(TableCell, {
  shouldForwardProp: (prop) =>
    prop !== "isSelected" &&
    prop !== "highlightLeftBorder" &&
    prop !== "highlightRightBorder" &&
    prop !== "highlightTopBorder" &&
    prop !== "highlightBottomBorder",
})(
  ({
    isSelected,
    highlightLeftBorder,
    highlightRightBorder,
    highlightTopBorder,
    highlightBottomBorder,
  }) => {
    const border = {};
    if (highlightLeftBorder) border.borderLeftColor = `${borderHighlightColor}`;
    if (highlightRightBorder)
      border.borderRightColor = `${borderHighlightColor}`;
    if (highlightTopBorder) border.borderTopColor = `${borderHighlightColor}`;
    if (highlightBottomBorder)
      border.borderBottomColor = `${borderHighlightColor}`;

    return {
      margin: borderWidth,
      padding: `4px`,
      backgroundColor: isSelected ? "rgba(25, 118, 210, 0.08)" : "inherit",
      border: `${borderWidth}px solid ${defaultBorderColor}`,
      ...(Object.keys(border).length > 0 && {
        ...border,
      }),
    };
  }
);

export default StyledTableCell;
