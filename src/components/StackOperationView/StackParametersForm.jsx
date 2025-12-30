/**
 * @fileoverview StackParametersForm Component
 *
 * A form component for configuring STACK (union) operation parameters including
 * operation name and type. Simpler than PackParametersForm since STACK operations
 * don't require join keys or predicates.
 *
 * Features:
 * - Operation name editing
 * - Operation type switching (STACK/PACK)
 * - Error state visualization
 * - Loading state handling
 *
 * @module components/StackOperationView/StackParametersForm
 *
 * @example
 * <EnhancedStackParametersForm id="stack-operation-123" />
 */

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
import { withOperationData, withStackOperationData } from "../HOC";

/* eslint-disable react/prop-types */

/**
 * StackParametersForm Component
 *
 * Form for configuring STACK operation parameters.
 *
 * @component
 * @param {Object} props - Component props (provided via HOCs)
 * @param {string} props.id - Operation identifier
 * @param {string} props.name - Current operation name
 * @param {string} props.operationType - Current operation type
 * @param {boolean} props.isLoading - Loading state
 * @param {Function} props.setOperationType - Update operation type
 * @param {Function} props.setOperationName - Update operation name
 * @param {Array} [props.alerts=[]] - Array of alerts
 *
 * @returns {React.ReactElement} A form with operation name and type fields
 */
const StackParametersForm = ({
  id,
  name,
  operationType,
  isLoading,
  setOperationType,
  setOperationName,
  alerts = [], // TODO? where is this coming from?
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
        onChange={(event) => setOperationName(event.target.value)}
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

const EnhancedStackParametersForm = withOperationData(
  withStackOperationData(StackParametersForm)
);
EnhancedStackParametersForm.displayName = "EnhancedStackParametersForm";

export default EnhancedStackParametersForm;
