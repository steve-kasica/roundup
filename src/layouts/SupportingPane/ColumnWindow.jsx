/**
 * @fileoverview Column detail window component.
 * @module layouts/SupportingPane/ColumnWindow
 *
 * Right sidebar component that displays column details or column
 * comparison views based on the number of focused columns.
 *
 * Features:
 * - Single column: Shows EnhancedColumnDetails
 * - Multiple columns: Shows ColumnValuesComparison
 * - Close button to clear focused columns
 * - Positioned absolutely within parent container
 *
 * @example
 * <ColumnWindow columnIds={['col_1', 'col_2']} />
 */
/* eslint-disable react/prop-types */
import { useDispatch } from "react-redux";
import ColumnDetail from "../../components/ColumnDetail";
import { IconButton, Box } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { setFocusedColumnIds } from "../../slices/uiSlice";
import ColumnValuesComparison from "../../components/ColumnValuesComparison/ColumnValuesComparison";

const RightSidebar = ({ columnIds }) => {
  const dispatch = useDispatch();
  const isSingleColumn = columnIds && columnIds.length === 1;
  const isMultipleColumnsInStack = columnIds && columnIds.length > 1;

  const handleClose = () => {
    dispatch(setFocusedColumnIds([]));
  };

  // TODO: implement
  // const isMultipleColumnsInPack =
  //   selectedColumns && selectedColumns.length === 2 && false;
  // const isMultipleColumnInTable =
  //   selectedColumns && selectedColumns.length > 2 && false;
  return (
    <Box height="100%" sx={{ position: "relative" }}>
      <IconButton
        size="small"
        onClick={handleClose}
        sx={{
          color: "text.secondary",
          position: "absolute",
          top: 8,
          right: 8,
          zIndex: 1,
        }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
      {isSingleColumn ? (
        <ColumnDetail id={columnIds[0]} />
      ) : isMultipleColumnsInStack ? (
        <ColumnValuesComparison columnIds={columnIds} />
      ) : null}
    </Box>
  );
};

export default RightSidebar;
