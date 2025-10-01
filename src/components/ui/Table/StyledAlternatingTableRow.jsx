import { TableRow } from "@mui/material";
import { styled } from "@mui/system";
/**
 * Styled TableRow component with alternating row colors and hover effects
 * Provides visual feedback for row interactions
 */
const StyledAlternatingTableRow = styled(TableRow)(({ isEven }) => ({
  backgroundColor: isEven ? "#fff" : "#f5f5f5",
  "&:hover": {
    backgroundColor: isEven ? "#e3f2fd" : "#bbdefb",
  },
  "&:hover td": {
    backgroundColor: "inherit", // Inherit row hover color
  },
  transition: "background-color 0.1s ease",
}));

export default StyledAlternatingTableRow;
