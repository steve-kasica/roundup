import { Typography } from "@mui/material";
import StyledTableCell from "./StyledTableCell";
import StyledAlternatingTableRow from "./StyledAlternatingTableRow";

function DummyRow({
  columnCount,
  rowIndex = 0,
  rowMarginStyle = {},
  maxColumnWidth,
}) {
  return (
    <StyledAlternatingTableRow
      key={`no-columns-${rowIndex}`}
      isEven={rowIndex % 2 === 0}
    >
      <StyledTableCell isSticky={true} sx={rowMarginStyle}>
        {rowIndex + 1}
      </StyledTableCell>
      {Array.from({ length: columnCount }).map((colId, i) => {
        return (
          <StyledTableCell
            key={i}
            align="center"
            isEven={rowIndex % 2 === 0}
            sx={{
              maxWidth: maxColumnWidth,
            }}
          >
            <Typography
              color="text.secondary"
              sx={{
                fontStyle: "italic",
                opacity: 0.3,
                userSelect: "none",
              }}
            >
              No Data
            </Typography>
          </StyledTableCell>
        );
      })}
    </StyledAlternatingTableRow>
  );
}
export default DummyRow;
