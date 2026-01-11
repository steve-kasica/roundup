import { Chip, styled } from "@mui/material";

const ValueChip = styled(Chip)(({ theme }) => ({
  backgroundColor: "#ddd",
  color: "#000",
  fontSize: "0.75rem",
  borderRadius: "4px",
  height: "12.5px",
  "& .MuiChip-label": { padding: "0 4px" },
}));
export default ValueChip;
