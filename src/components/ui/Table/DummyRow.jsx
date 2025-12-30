/**
 * @fileoverview DummyRow Component
 *
 * A placeholder table row component displaying "No columns" message when a table
 * has no column data. Provides visual feedback for empty tables with consistent
 * styling and layout.
 *
 * Features:
 * - Alternating row colors
 * - Centered "No columns" message
 * - Colspan handling for full-width display
 * - Row number column support
 * - Customizable row margins and column width
 *
 * @module components/ui/Table/DummyRow
 *
 * @example
 * <DummyRow
 *   columnCount={5}
 *   rowIndex={0}
 *   maxColumnWidth={200}
 * />
 */

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
