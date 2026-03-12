import {
  FormControl,
  FormControlLabel,
  InputLabel,
  Radio,
  Box,
  RadioGroup,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { EnhancedTableLabel } from "../../../TableView";
import { EnhancedOperationLabel } from "../../../OperationView/OperationLabel";
import { isTableId } from "../../../../slices/tablesSlice";
import { cross, descending } from "d3";

const TableOrderRadio = ({ childIds, onChange, isDisabled }) => {
  const [value, setValue] = useState();

  const options = cross(childIds, childIds)
    .filter(([a, b]) => a !== b)
    .sort((a, b) => descending(a.join("|"), b.join("|")));

  const defaultValue = `${childIds[0]}|${childIds[1]}`;

  if (!value) {
    setValue(defaultValue);
  }

  useEffect(() => {
    if (onChange) {
      const [leftTableId, rightTableId] = value.split("|");
      onChange(leftTableId, rightTableId);
    }
  }, [value, onChange]);

  return (
    <FormControl fullWidth sx={{ mb: 2 }} size="small" disabled={isDisabled}>
      <InputLabel sx={{ position: "relative", transform: "none", mb: 1 }}>
        Table order
      </InputLabel>
      <RadioGroup
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={isDisabled}
        aria-label="Table order"
      >
        {options.map(([leftTableId, rightTableId]) => (
          <FormControlLabel
            key={`${leftTableId}|${rightTableId}`}
            value={`${leftTableId}|${rightTableId}`}
            control={<Radio disabled={isDisabled} />}
            label={
              <Box display="flex" alignItems="center" gap={1} overflow="hidden" minWidth={0}>
                {isTableId(leftTableId) ? (
                  <EnhancedTableLabel
                    id={leftTableId}
                    sx={{
                      minWidth: 0,
                      flex: "1 1 50%",
                      overflow: "hidden",
                    }}
                  />
                ) : (
                  <EnhancedOperationLabel id={leftTableId} />
                )}
                <Typography sx={{ flexShrink: 0 }}>|</Typography>
                {isTableId(rightTableId) ? (
                  <EnhancedTableLabel
                    id={rightTableId}
                    sx={{
                      minWidth: 0,
                      flex: "1 1 50%",
                      overflow: "hidden",
                    }}
                  />
                ) : (
                  <EnhancedOperationLabel id={rightTableId} />
                )}
              </Box>
            }
          />
        ))}
      </RadioGroup>
    </FormControl>
  );
};

export default TableOrderRadio;
