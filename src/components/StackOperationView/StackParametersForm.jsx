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
  JOIN_PREDICATES,
  OPERATION_TYPE_PACK,
  OPERATION_TYPE_STACK,
} from "../../slices/operationsSlice";
import withStackOperationData from "./withStackOperationData";

/* eslint-disable react/prop-types */

const StackParametersForm = ({
  operation,
  isLoading,
  setOperationType,
  setName,
}) => {
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
      sx={{ display: "flex", flexDirection: "column", gap: 3 }}
    >
      <TextField
        fullWidth
        label="Operation Name"
        value={operation.name}
        onChange={(event) => setName(event.target.value)}
        placeholder={operation?.name}
      />

      <FormControl fullWidth>
        <InputLabel>Operation Type</InputLabel>
        <Select
          value={operation.operationType}
          onChange={(event) => setOperationType(event.target.value)}
          label="Operation Type"
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
