/**
 * @fileoverview StyledAlternatingTableRow Component
 *
 * A styled table row component with alternating background colors and hover effects.
 * Provides consistent visual feedback for row interactions across the application.
 *
 * Features:
 * - Alternating row colors (white/gray)
 * - Hover effects with blue tints
 * - Disabled state support
 * - Cell background inheritance
 * - Pointer cursor on hover
 *
 * @module components/ui/Table/StyledAlternatingTableRow
 *
 * @example
 * <StyledAlternatingTableRow isEven={true} isDisabled={false}>
 *   <TableCell>Content</TableCell>
 * </StyledAlternatingTableRow>
 */

import { TableRow } from "@mui/material";
import { styled } from "@mui/system";
/**
 * Styled TableRow component with alternating row colors and hover effects
 * Provides visual feedback for row interactions
 */
const StyledAlternatingTableRow = styled(TableRow, {
  shouldForwardProp: (prop) => prop !== "isEven" && prop !== "isDisabled",
})(({ isEven, isDisabled }) => ({
  backgroundColor: isEven ? "#fff" : "#f5f5f5",
  "&:hover": {
    backgroundColor: isEven ? "#e3f2fd" : "#bbdefb",
  },
  "&:hover td": {
    backgroundColor: "inherit", // Inherit row hover color
  },
  transition: "background-color 0.1s ease",
  ...(isDisabled && {
    opacity: 0.5,
    pointerEvents: "none",
    backgroundColor: "#e0e0e0",
    color: "#9e9e9e",
    "&:hover": {
      backgroundColor: "#e0e0e0",
    },
  }),
}));

export default StyledAlternatingTableRow;
