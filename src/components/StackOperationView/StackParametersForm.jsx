import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
} from "@mui/material";
import {
  OPERATION_TYPE_PACK,
  OPERATION_TYPE_STACK,
} from "../../slices/operationsSlice";
import withStackOperationData from "./withStackOperationData";

/* eslint-disable react/prop-types */

const StackParametersForm = ({
  id,
  name,
  operationType,
  isLoading,
  setOperationType,
  setName,
  alerts = [],
}) => {
  const totalCount = alerts.length > 0;

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      component="form"
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 3,
        border: totalCount ? "2px solid" : "none",
        borderColor: totalCount ? "error.main" : "transparent",
        borderRadius: totalCount ? 1 : 0,
        backgroundColor: totalCount ? "error.lighter" : "transparent",
        padding: totalCount ? 2 : 0,
      }}
    >
      <TextField
        fullWidth
        label="Operation Name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder={name || id}
        error={totalCount}
      />

      <FormControl fullWidth error={totalCount}>
        <InputLabel>Operation Type</InputLabel>
        <Select
          value={operationType}
          onChange={(event) => setOperationType(event.target.value)}
          label="Operation Type"
          error={totalCount}
        >
          <MenuItem value={OPERATION_TYPE_PACK}>Pack</MenuItem>
          <MenuItem value={OPERATION_TYPE_STACK}>Stack</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};

StackParametersForm.displayName = "StackParametersForm";

const EnhancedStackParametersForm = withStackOperationData(StackParametersForm);
EnhancedStackParametersForm.displayName = "EnhancedStackParametersForm";

export default EnhancedStackParametersForm;
