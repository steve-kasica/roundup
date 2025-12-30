/**
 * @fileoverview StyledTableCell Component
 *
 * A styled table cell with column-specific hover effects that override row hover
 * states. Provides individual column highlighting for better data tracking.
 *
 * Features:
 * - Column hover effects
 * - Row alternation awareness
 * - Sticky cell support
 * - Background color transitions
 * - Conditional styling based on states
 *
 * @module components/ui/Table/StyledTableCell
 *
 * @example
 * <StyledTableCell isHovered={true} isEven={false} isSticky={false}>
 *   Cell content
 * </StyledTableCell>
 */

import { TableCell } from "@mui/material";
import { styled } from "@mui/system";
/**
 * Styled TableCell with column-specific hover effects
 * Handles individual column highlighting that overrides row hover
 */
const StyledTableCell = styled(TableCell, {
  shouldForwardProp: (prop) =>
    !["isHovered", "isEven", "isSticky"].includes(prop),
})(({ isHovered, isEven, isSticky }) => ({
  backgroundColor:
    isHovered && isEven
      ? "#e3f2fd"
      : isHovered && !isEven
      ? "#bbdefb"
      : "transparent",
  transition: "background-color 0.1s ease",
  // maxWidth: maxWidth, // Dynamic maximum column width
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  zIndex: 1,
  ...(isSticky && {
    position: "sticky",
    left: 0,
    // left: `${index * parseInt(maxWidth.replace("px", ""), 10)}px`,
    zIndex: 100,
    // borderRight: "1px solid rgba(224, 224, 224, 1)",
  }),
}));

export default StyledTableCell;
