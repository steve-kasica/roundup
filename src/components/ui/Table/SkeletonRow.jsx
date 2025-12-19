import { CircularProgress } from "@mui/material";
import StyledAlternatingTableRow from "./StyledAlternatingTableRow";
import StyledTableCell from "./StyledTableCell";

const SkeletonRow = ({
  rowIndex,
  columnCount,
  rowMarginStyle = {},
  maxColumnWidth,
}) => {
  return (
    /* Initial Loading State - Skeleton rows with loading indicators */
    <StyledAlternatingTableRow isEven={rowIndex % 2 === 0}>
      <StyledTableCell isSticky={true} sx={rowMarginStyle}>
        {rowIndex}
      </StyledTableCell>
      {Array.from({ length: columnCount }).map((_, i) => {
        return (
          <StyledTableCell
            key={i}
            align="center"
            isEven={rowIndex % 2 === 0}
            sx={{
              maxWidth: maxColumnWidth,
            }}
          >
            <CircularProgress size={16} />
          </StyledTableCell>
        );
      })}
    </StyledAlternatingTableRow>
  );
};

export default SkeletonRow;
