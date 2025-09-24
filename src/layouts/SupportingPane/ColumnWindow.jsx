import { useSelector, useDispatch } from "react-redux";
import { SingleColumn } from "../../components/ColumnViews";
import { clearFocusedColumns } from "../../slices/columnsSlice";
import { Typography, IconButton, Box } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import ColumnIndexDetails from "../../components/ColumnIndexDetails";

const RightSidebar = () => {
  const dispatch = useDispatch();
  const focusedColumns = useSelector((state) => state.columns.focused);
  const isSingleColumn = focusedColumns && focusedColumns.length === 1;
  const isMultipleColumnsInStack = focusedColumns && focusedColumns.length > 1;

  const handleClose = () => {
    dispatch(clearFocusedColumns());
  };

  // TODO: implement
  // const isMultipleColumnsInPack =
  //   selectedColumns && selectedColumns.length === 2 && false;
  // const isMultipleColumnInTable =
  //   selectedColumns && selectedColumns.length > 2 && false;
  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        <Typography variant="window-label">Column detail window</Typography>
        <IconButton
          size="small"
          onClick={handleClose}
          sx={{ color: "text.secondary" }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
      {isSingleColumn && <SingleColumn id={focusedColumns[0]} />}
      {isMultipleColumnsInStack && (
        <ColumnIndexDetails columnIds={focusedColumns} />
      )}
    </>
  );
};

export default RightSidebar;
