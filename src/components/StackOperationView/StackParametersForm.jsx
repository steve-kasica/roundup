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
  alerts = [],
}) => {
  const hasAlerts = alerts.length > 0;

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
        border: hasAlerts ? "2px solid" : "none",
        borderColor: hasAlerts ? "error.main" : "transparent",
        borderRadius: hasAlerts ? 1 : 0,
        backgroundColor: hasAlerts ? "error.lighter" : "transparent",
        padding: hasAlerts ? 2 : 0,
      }}
    >
      <TextField
        fullWidth
        label="Operation Name"
        value={operation.name}
        onChange={(event) => setName(event.target.value)}
        placeholder={operation?.name}
        error={hasAlerts}
      />

      <FormControl fullWidth error={hasAlerts}>
        <InputLabel>Operation Type</InputLabel>
        <Select
          value={operation.operationType}
          onChange={(event) => setOperationType(event.target.value)}
          label="Operation Type"
          error={hasAlerts}
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
