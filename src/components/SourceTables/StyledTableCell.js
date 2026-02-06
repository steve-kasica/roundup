import { styled, TableCell } from "@mui/material";

const StyledTableCell = styled(TableCell, {
  shouldForwardProp: (prop) =>
    !["isSelected", "isPrevSelected", "isNextSelected"].includes(prop),
})(({ theme, isSelected, isPrevSelected, isNextSelected }) => ({
  padding: 0,
  border: "1px solid",
  borderColor: theme.palette.grey[300],
}));

export default StyledTableCell;
