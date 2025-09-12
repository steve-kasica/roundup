import { Box, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { RawTableRows } from "../../components/TableView";
import { selectFocusedOperationId } from "../../slices/operationsSlice";
const BottomPane = () => {
  const tableId = useSelector((state) => {
    const focusedOperation = selectFocusedOperationId(state);
    if (!focusedOperation) return null;
    return state.operations.data[focusedOperation].children[0];
  });
  return (
    <Box sx={{ p: 2 }}>
      {tableId && <RawTableRows id={tableId} />}
      {!tableId && (
        <Typography variant="body2" color="text.secondary">
          No table selected.
        </Typography>
      )}
    </Box>
  );
};

export default BottomPane;
