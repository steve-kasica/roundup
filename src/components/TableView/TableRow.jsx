import { Box, styled } from "@mui/material";

const TableRow = styled(Box)(({ theme, index }) => ({
  display: "flex",
  justifyContent: "space-evenly",
  marginLeft: 2,
  borderBottom: "1px solid",
  borderColor: "divider",
  "&:hover": {
    backgroundColor: "#eee",
    fontWeight: "bold",
  },
}));

export default TableRow;
