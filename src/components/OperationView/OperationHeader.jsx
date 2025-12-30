/**
 * @fileoverview OperationHeader Component
 *
 * Renders a horizontal header row showing all columns in an operation, with special
 * visual treatment for key columns used in join operations. Each column is displayed
 * as a clickable cell that can trigger column-specific actions.
 *
 * This component is typically used at the top of operation visualizations to provide
 * quick access to column information and operations.
 *
 * @module components/OperationView/OperationHeader
 *
 * @example
 * <EnhancedOperationHeader
 *   id="operation-123"
 *   keyColumnId="col-5"
 *   onColumnClick={handleColumnClick}
 * />
 */

/* eslint-disable react/prop-types */
import { Box } from "@mui/material";
import withOperationData from "../HOC/withOperationData";
import { EnhancedColumnName } from "../ColumnViews";

/**
 * OperationHeader Component
 *
 * A row of column headers with equal-width cells and optional key indicator.
 *
 * @component
 * @param {Object} props - Component props
 * @param {string[]} props.columnIds - Array of column IDs to display
 * @param {number} props.columnCount - Total number of columns
 * @param {string} [props.keyColumnId] - ID of the key column (shows special indicator)
 * @param {Function} props.onColumnClick - Callback when column is clicked (event, columnId)
 *
 * @returns {React.ReactElement} A flex row of column header cells
 *
 * @description
 * Visual features:
 * - Equal width distribution across all columns
 * - Key column displays with a 🔑 icon badge above it
 * - Click interaction for column selection
 * - Hover effects for better UX
 * - Column names displayed via EnhancedColumnName component
 */
const OperationHeader = ({
  // Props passed via withOperationData HOC
  columnIds,
  columnCount,
  // Props passed directly from parent component
  keyColumnId,
  onColumnClick,
}) => {
  const columnWidth = (1 / columnCount) * 100 + "%";

  return (
    <Box display="flex" width="100%" gap={"1px"}>
      {columnIds.map((columnId) => (
        <Box
          key={columnId}
          backgroundColor="#ddd"
          width={columnWidth}
          display="flex"
          alignItems="center"
          justifyContent="center"
          height={"25px"}
          cursor="pointer"
          sx={{
            ...(columnId === keyColumnId && {
              // border: "2px solid",
              fontWeight: "bold",
              position: "relative",
              "&:before": {
                content: '"🔑"',
                position: "absolute",
                top: "-29px",
                left: "50%",
                transform: "translateX(-50%)",
                backgroundColor: "primary.main",
                borderRadius: "50%",
                fontSize: "10px",
                color: "white",
                width: "15px",
                height: "15px",
                textAlign: "center",
                lineHeight: "15px",
                padding: "5px",
                zIndex: 1,
              },
            }),
          }}
          onClick={(event) => onColumnClick(event, columnId)}
        >
          <EnhancedColumnName
            id={columnId}
            sx={{
              fontSize: "0.8rem",
              cursor: "pointer",
              fontWeight: "inherit",
              "&:hover": {
                backgroundColor: "#555",
              },
            }}
          />
        </Box>
      ))}
    </Box>
  );
};

const EnhancedOperationHeader = withOperationData(OperationHeader);

export { EnhancedOperationHeader, OperationHeader };
