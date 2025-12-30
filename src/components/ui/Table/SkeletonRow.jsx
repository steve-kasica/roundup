/**
 * @fileoverview SkeletonRow Component
 *
 * A loading skeleton row component displaying circular progress indicators for each
 * cell. Used during initial data loading to provide visual feedback and maintain
 * table structure.
 *
 * Features:
 * - Alternating row colors
 * - Loading spinner in each cell
 * - Sticky row number column
 * - Customizable column count
 * - Row margin styling support
 *
 * @module components/ui/Table/SkeletonRow
 *
 * @example
 * <SkeletonRow
 *   rowIndex={0}
 *   columnCount={5}
 *   maxColumnWidth={200}
 * />
 */

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
