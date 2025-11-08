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
import { EnhancedColumnName } from "../ColumnViews";

/* eslint-disable react/prop-types */

const PackParametersForm = ({
  name,
  joinPredicate,
  leftKey,
  rightKey,
  operationType,
  rightHandColumns,
  leftHandColumns,
  isLoading,
  alerts = [],
  setJoinPredicate,
  setLeftTableJoinKey,
  setRightTableJoinKey,
  setOperationType,
  setName,
}) => {
  const hasAlerts = alerts.length > 0;
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
        value={name}
        onChange={(event) => setName(event.target.value)}
        helperText={errors.name}
        placeholder={name}
        error={hasAlerts}
      />

      <FormControl fullWidth error={!!errors.rightJoinKey || hasAlerts}>
        <InputLabel>Operation Type</InputLabel>
        <Select
          value={operationType}
          onChange={(event) => setOperationType(event.target.value)}
          label="Operation Type"
          error={hasAlerts}
        >
          <MenuItem value={OPERATION_TYPE_PACK}>Pack</MenuItem>
          <MenuItem value={OPERATION_TYPE_STACK}>Stack</MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth error={!!errors.rightJoinKey || hasAlerts}>
        <InputLabel>Join Predicate</InputLabel>
        <Select
          value={joinPredicate}
          onChange={(event) => setJoinPredicate(event.target.value)}
          label="Join Predicate"
          error={hasAlerts}
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
        error={!!errors.leftJoinKey || !leftKey || hasAlerts}
      >
        <InputLabel>Left Join Key</InputLabel>
        <Select
          value={leftKey || ""}
          onChange={(event) => setLeftTableJoinKey(event.target.value)}
          label="Left Join Key"
          error={hasAlerts}
        >
          {leftHandColumns &&
            leftHandColumns.map((columnId) => (
              <MenuItem key={columnId} value={columnId}>
                <EnhancedColumnName id={columnId} />
              </MenuItem>
            ))}
        </Select>
        {!leftKey && (
          <FormHelperText>{"Left join key is required"}</FormHelperText>
        )}
      </FormControl>

      <FormControl
        fullWidth
        error={!!errors.rightJoinKey || !rightKey || hasAlerts}
      >
        <InputLabel>Right Join Key</InputLabel>
        <Select
          value={rightKey || ""}
          onChange={(event) => setRightTableJoinKey(event.target.value)}
          label="Right Join Key"
          error={hasAlerts}
        >
          {rightHandColumns &&
            rightHandColumns.map((columnId) => (
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

const EnhancedPackParametersForm = withPackOperationData(PackParametersForm);
EnhancedPackParametersForm.displayName = "EnhancedPackParametersForm";

export default EnhancedPackParametersForm;
