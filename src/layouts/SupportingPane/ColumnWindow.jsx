/* eslint-disable react/prop-types */
import { useDispatch } from "react-redux";
import { ColumnDetails } from "../../components/ColumnViews";
import { clearFocusedColumns } from "../../slices/columnsSlice";
import { Typography, IconButton, Box } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import ColumnIndexDetails from "../../components/ColumnIndexDetails";

const RightSidebar = ({ columnIds }) => {
  const dispatch = useDispatch();
  const isSingleColumn = columnIds && columnIds.length === 1;
  const isMultipleColumnsInStack = columnIds && columnIds.length > 1;

  const handleClose = () => {
    dispatch(clearFocusedColumns());
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
      {isSingleColumn && <ColumnDetails id={columnIds[0]} />}
      {isMultipleColumnsInStack && <ColumnIndexDetails columnIds={columnIds} />}
    </Box>
  );
};

export default RightSidebar;
