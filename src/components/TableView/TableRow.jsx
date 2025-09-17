import { Box, styled } from "@mui/material";
const TableRow = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-evenly",
  marginLeft: 2,
  borderBottom: "1px solid",
  borderColor: "divider",
}));

export default TableRow;
