import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import { useSelector } from "react-redux";
import {
  isOperationId,
  selectAllOperationIds,
} from "../../../slices/operationsSlice";
import { useCallback, useMemo } from "react";
import { EnhancedOperationItem } from "./OperationItem";

const OperationSelect = ({ focusedObjectId, onChange }) => {
  const allOperationIds = useSelector(selectAllOperationIds);

  const isFocusedObjectOperation = useMemo(
    () => isOperationId(focusedObjectId),
    [focusedObjectId],
  );

  const reversedOperationIds = useMemo(
    () => [...allOperationIds].reverse(),
    [allOperationIds],
  );

  const renderValue = useCallback((value) => {
    if (!isOperationId(value)) {
      return "";
    }
    return (
      <MenuItem>
        <EnhancedOperationItem id={value} />
      </MenuItem>
    );
  }, []);

  const handleOnChange = useCallback(
    (event) => {
      const newValue = event.target.value;
      if (onChange) {
        onChange(newValue);
      }
    },
    [onChange],
  );

  return (
    <FormControl
      className="OperationSelect"
      fullWidth
      sx={{ mb: 1 }}
      size="small"
    >
      <InputLabel id="operations-list-select">Operations</InputLabel>
      <Select
        labelId="operations-list-select"
        id="operations-select"
        value={isFocusedObjectOperation ? focusedObjectId : ""}
        label="Operations"
        onChange={handleOnChange}
        renderValue={renderValue}
      >
        {reversedOperationIds.map((operationId) => (
          <MenuItem value={operationId} key={operationId}>
            <EnhancedOperationItem id={operationId} />
          </MenuItem>
        ))}
      </Select>
      <FormHelperText>
        Select an operation to focus and view details
      </FormHelperText>
    </FormControl>
  );
};

export default OperationSelect;
