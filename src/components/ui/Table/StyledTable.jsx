import { styled } from "@mui/material/styles";
import { Table } from "@mui/material";

const StyledTable = styled(Table)(({ theme }) => ({
  width: "100%",
  tableLayout: "auto",
}));

export default StyledTable;
