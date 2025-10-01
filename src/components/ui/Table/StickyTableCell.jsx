import { TableCell, styled } from "@mui/material";
/**
 * Sticky row number cell that remains fixed during horizontal scrolling
 * Provides persistent row identification regardless of scroll position
 */
const StickyTableCell = styled(TableCell)(() => ({
  position: "sticky",
  left: 0,
  maxWidth: "10px",
  backgroundColor: "inherit",
  textAlign: "right",
  color: "#888",
  zIndex: 1,
  borderRight: "1px solid rgba(224, 224, 224, 1)",
}));

export default StickyTableCell;
