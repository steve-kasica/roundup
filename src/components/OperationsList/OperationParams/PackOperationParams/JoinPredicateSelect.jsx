import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import {
  DEFAULT_JOIN_PREDICATE,
  JOIN_PREDICATES,
} from "../../../../slices/operationsSlice";
import { useState } from "react";
import { TitleCaseText } from "../../../ui/text";

const JoinPredicateSelect = ({ joinPredicate, onChange, sx, isDisabled }) => {
  const [value, setValue] = useState(joinPredicate || DEFAULT_JOIN_PREDICATE);
  const handleChange = (event) => {
    const newValue = event.target.value;
    setValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };
  return (
    <FormControl fullWidth sx={{ mb: 2, mt: 1, ...sx }}>
      <InputLabel id="pack-predicate-select-label">Match condition</InputLabel>
      <Select
        labelId="pack-predicate-select-label"
        id="pack-predicate-select"
        value={value}
        label="Match condition"
        onChange={handleChange}
        renderValue={(selected) => <TitleCaseText text={selected} />}
        disabled={isDisabled}
      >
        {Object.keys(JOIN_PREDICATES).map((predicateValue) => (
          <MenuItem
            key={predicateValue}
            value={predicateValue}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              justifyContent: "space-between",
            }}
          >
            <TitleCaseText text={predicateValue} />
            {value === predicateValue ? (
              <Typography
                variant="data-sm"
                component={"small"}
                sx={{
                  color: (theme) => theme.palette.text.secondary,
                }}
              >
                &nbsp;(current)
              </Typography>
            ) : (
              ""
            )}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default JoinPredicateSelect;
