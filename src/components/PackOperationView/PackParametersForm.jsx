/**
 * @fileoverview PackParametersForm Component
 *
 * A form component for configuring PACK (join) operation parameters including operation
 * name, type, join predicate, and join keys for both left and right tables.
 *
 * This form provides the main interface for users to configure how tables should be
 * joined together, including all necessary join configuration options.
 *
 * Features:
 * - Operation name editing
 * - Operation type switching (PACK/STACK)
 * - Join predicate selection (EQUALS, etc.)
 * - Left and right join key selection
 * - Error state visualization
 * - Loading state handling
 *
 * @module components/PackOperationView/PackParametersForm
 *
 * @example
 * <EnhancedPackParametersForm id="pack-operation-123" />
 */

import { useState, useEffect } from "react";

import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  FormHelperText,
} from "@mui/material";
import { withPackOperationData, withOperationData } from "../HOC";
import {
  JOIN_PREDICATES,
  OPERATION_TYPE_PACK,
  OPERATION_TYPE_STACK,
} from "../../slices/operationsSlice";
import { EnhancedColumnName } from "../ColumnViews";

/**
 * PackParametersForm Component
 *
 * Form for configuring PACK operation join parameters.
 *
 * @component
 * @param {Object} props - Component props (provided via HOCs)
 * @param {string} props.name - Current operation name
 * @param {string} props.joinPredicate - Join predicate type (EQUALS, etc.)
 * @param {string} props.leftKey - Left table join column ID
 * @param {string} props.rightKey - Right table join column ID
 * @param {string} props.operationType - Current operation type
 * @param {string[]} props.rightColumnIds - Available columns from right table
 * @param {string[]} props.leftColumnIds - Available columns from left table
 * @param {boolean} props.isLoading - Loading state
 * @param {Array} [props.alerts=[]] - Array of alerts for this operation
 * @param {Function} props.setJoinPredicate - Update join predicate
 * @param {Function} props.setLeftTableJoinKey - Update left join key
 * @param {Function} props.setRightTableJoinKey - Update right join key
 * @param {Function} props.setOperationType - Update operation type
 * @param {Function} props.setOperationName - Update operation name
 *
 * @returns {React.ReactElement} A form with all join configuration fields
 */
const PackParametersForm = ({
  name,
  joinPredicate,
  leftKey,
  rightKey,
  operationType,
  rightColumnIds,
  leftColumnIds,
  isLoading,
  alerts = [],
  setJoinPredicate,
  setLeftTableJoinKey,
  setRightTableJoinKey,
  setOperationType,
  setOperationName,
}) => {
  const totalCount = alerts.length > 0;
  const [formData, setFormData] = useState({
    leftJoinKey: "",
    rightJoinKey: "",
    tableOrder: [],
    name: "",
    description: "",
  });
  const [errors, setErrors] = useState({});

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
        helperText={errors.name}
        placeholder={name}
        error={totalCount}
      />

      <FormControl fullWidth error={!!errors.rightJoinKey || totalCount}>
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

      <FormControl fullWidth error={!!errors.rightJoinKey || totalCount}>
        <InputLabel>Join Predicate</InputLabel>
        <Select
          value={joinPredicate}
          onChange={(event) => setJoinPredicate(event.target.value)}
          label="Join Predicate"
          error={totalCount}
        >
          {Object.keys(JOIN_PREDICATES).map((predicate) => (
            <MenuItem key={predicate} value={predicate}>
              {predicate}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl
        fullWidth
        error={!!errors.leftJoinKey || !leftKey || totalCount}
      >
        <InputLabel>Left Join Key</InputLabel>
        <Select
          value={leftKey || ""}
          onChange={(event) => setLeftTableJoinKey(event.target.value)}
          label="Left Join Key"
          error={totalCount}
        >
          {leftColumnIds &&
            leftColumnIds.map((columnId) => (
              <MenuItem key={columnId} value={columnId}>
                <EnhancedColumnName id={columnId} sx={{ color: "black" }} />
              </MenuItem>
            ))}
        </Select>
        {!leftKey && (
          <FormHelperText>{"Left join key is required"}</FormHelperText>
        )}
      </FormControl>

      <FormControl
        fullWidth
        error={!!errors.rightJoinKey || !rightKey || totalCount}
      >
        <InputLabel>Right Join Key</InputLabel>
        <Select
          value={rightKey || ""}
          onChange={(event) => setRightTableJoinKey(event.target.value)}
          label="Right Join Key"
          error={totalCount}
        >
          {rightColumnIds &&
            rightColumnIds.map((columnId) => (
              <MenuItem key={columnId} value={columnId}>
                <EnhancedColumnName id={columnId} />
              </MenuItem>
            ))}
        </Select>
        {!rightKey && (
          <FormHelperText>{"Right join key is required"}</FormHelperText>
        )}
      </FormControl>
    </Box>
  );
};

PackParametersForm.displayName = "PackParametersForm";

const EnhancedPackParametersForm = withOperationData(
  withPackOperationData(PackParametersForm)
);

EnhancedPackParametersForm.displayName = "EnhancedPackParametersForm";

export { PackParametersForm, EnhancedPackParametersForm };
