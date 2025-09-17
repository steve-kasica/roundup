import { Box } from "@mui/material";
import { styled } from "@mui/material/styles";

const TableCell = styled(Box)(({ theme, width }) => ({
  padding: "6px 16px",
  display: "flex",
  alignItems: "left",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  backgroundColor: "inherit",
  width: width || "200px",
  maxWidth: width || "75px",
  minWidth: width || "75px",
  flexShrink: 1,
  flexGrow: 1,

  // Variants for different cell types
  "&.header": {
    fontWeight: "bold",
    borderBottom: `2px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
  },

  "&.index": {
    position: "sticky",
    left: 0,
    backgroundColor: theme.palette.background.paper,
    zIndex: 1,
    borderRight: `1px solid ${theme.palette.divider}`,
    justifyContent: "center",
  },

  "&.selected": {
    backgroundColor: theme.palette.action.selected,
  },

  "&.clickable": {
    cursor: "pointer",
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
  },

  // Responsive text handling
  [theme.breakpoints.down("sm")]: {
    padding: "4px 8px",
    fontSize: "0.875rem",
  },
}));

export default TableCell;
