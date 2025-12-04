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
  setName,
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
        onChange={(event) => setName(event.target.value)}
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

const EnhancedPackParametersForm = withPackOperationData(PackParametersForm);

EnhancedPackParametersForm.displayName = "EnhancedPackParametersForm";

export { PackParametersForm, EnhancedPackParametersForm };
