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
import withPackOperationData from "./withPackOperationData";
import {
  JOIN_PREDICATES,
  OPERATION_TYPE_PACK,
  OPERATION_TYPE_STACK,
} from "../../slices/operationsSlice";

/* eslint-disable react/prop-types */

const PackParametersForm = ({
  packOperation,
  operation,
  rightHandColumns,
  leftHandColumns,
  isLoading,
  setJoinPredicate,
  setLeftTableJoinKey,
  setRightTableJoinKey,
  setOperationType,
  setName,
}) => {
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
      sx={{ display: "flex", flexDirection: "column", gap: 3 }}
    >
      <TextField
        fullWidth
        label="Operation Name"
        value={operation.name}
        onChange={(event) => setName(event.target.value)}
        helperText={errors.name}
        placeholder={operation?.name}
      />

      <FormControl fullWidth error={!!errors.rightJoinKey}>
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

      <FormControl fullWidth error={!!errors.rightJoinKey}>
        <InputLabel>Join Predicate</InputLabel>
        <Select
          value={operation?.joinPredicate}
          onChange={(event) => setJoinPredicate(event.target.value)}
          label="Join Predicate"
        >
          {Object.keys(JOIN_PREDICATES).map((predicate) => (
            <MenuItem key={predicate} value={predicate}>
              {predicate}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth error={!!errors.leftJoinKey}>
        <InputLabel>Left Join Key</InputLabel>
        <Select
          value={operation?.joinKey1}
          onChange={(event) => setLeftTableJoinKey(event.target.value)}
          label="Left Join Key"
        >
          {leftHandColumns &&
            leftHandColumns.map((columnId) => (
              <MenuItem key={columnId} value={columnId}>
                {columnId}
              </MenuItem>
            ))}
        </Select>
        {errors.leftJoinKey && (
          <FormHelperText>{errors.leftJoinKey}</FormHelperText>
        )}
      </FormControl>

      <FormControl fullWidth error={!!errors.rightJoinKey}>
        <InputLabel>Right Join Key</InputLabel>
        <Select
          value={operation?.joinKey2}
          onChange={(event) => setRightTableJoinKey(event.target.value)}
          label="Right Join Key"
        >
          {rightHandColumns &&
            rightHandColumns.map((columnId) => (
              <MenuItem key={columnId} value={columnId}>
                {columnId}
              </MenuItem>
            ))}
        </Select>
        {errors.rightJoinKey && (
          <FormHelperText>{errors.rightJoinKey}</FormHelperText>
        )}
      </FormControl>
    </Box>
  );
};

PackParametersForm.displayName = "PackParametersForm";

const EnhancedPackParametersForm = withPackOperationData(PackParametersForm);
EnhancedPackParametersForm.displayName = "EnhancedPackParametersForm";

export default EnhancedPackParametersForm;
