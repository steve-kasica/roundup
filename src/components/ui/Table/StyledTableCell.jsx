import { TableCell } from "@mui/material";
import { styled } from "@mui/system";
/**
 * Styled TableCell with column-specific hover effects
 * Handles individual column highlighting that overrides row hover
 */
const StyledTableCell = styled(TableCell)(
  ({ isHovered, isEven, maxWidth = "200px" }) => ({
    backgroundColor:
      isHovered && isEven
        ? "#e3f2fd"
        : isHovered && !isEven
        ? "#bbdefb"
        : "transparent",
    transition: "background-color 0.1s ease",
    maxWidth: maxWidth, // Dynamic maximum column width
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  })
);

export default StyledTableCell;
