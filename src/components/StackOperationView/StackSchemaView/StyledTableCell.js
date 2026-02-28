import { styled } from "@mui/material/styles";
import TableCell from "@mui/material/TableCell";

const borderWidth = 2;

const StyledTableCell = styled(TableCell, {
  shouldForwardProp: (prop) => prop !== "isSelected",
})(({ theme, isSelected }) => ({
  margin: borderWidth,
  padding: 0,
  backgroundColor: isSelected ? theme.palette.action.selected : "inherit",
  border: `${borderWidth}px solid`,
  borderColor: isSelected ? theme.palette.primary.main : theme.palette.divider,
}));

export default StyledTableCell;
