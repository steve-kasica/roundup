import { Box, FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { EnhancedColumnMenuItemContent } from "./ColumnMenuItemContent";
import { useSelector } from "react-redux";
import { selectColumnsById } from "../../../../../slices/columnsSlice";
import { cross } from "d3";
import { useCallback, useEffect, useMemo, useState } from "react";
import { isTableId } from "../../../../../slices/tablesSlice";
import { EnhancedTableLabel } from "../../../../TableView";
import { EnhancedOperationLabel } from "../../../../OperationView/OperationLabel";

const JoinColumnsSelect = ({
  leftTableId,
  rightTableId,
  leftColumnIds,
  rightColumnIds,
  leftKeyId,
  rightKeyId,
  // Props directly from parent
  onChange,
  sx = {},
}) => {
  const [value, setValue] = useState(
    leftKeyId && rightKeyId ? `${leftKeyId}|${rightKeyId}` : "",
  );

  // If leftKeyId or rightKeyId change from outside, update value
  useEffect(() => {
    setValue(leftKeyId && rightKeyId ? `${leftKeyId}|${rightKeyId}` : "");
  }, [leftKeyId, rightKeyId]);

  const handleChange = useCallback(
    (value) => {
      setValue(value);
      if (onChange) {
        const [leftKeyId, rightKeyId] = value.split("|");
        onChange(leftKeyId, rightKeyId);
      }
    },
    [onChange],
  );

  const leftColumns = useSelector((state) =>
    selectColumnsById(state, leftColumnIds),
  );

  // const validLeftColumns = useMemo(() =>
  //   leftColumns.filter(
  //     (column) => column.columnType === COLUMN_TYPE_CATEGORICAL,
  //   ),
  // );

  const rightColumns = useSelector((state) =>
    selectColumnsById(state, rightColumnIds),
  );

  const options = useMemo(
    () => cross(leftColumns, rightColumns),
    [leftColumns, rightColumns],
  );

  return (
    <FormControl className="JoinColumnsSelect" fullWidth sx={{ ...sx }}>
      <InputLabel id="columns-select-label">Match columns</InputLabel>
      <Select
        labelId="columns-select-label"
        id="columns-select"
        value={value}
        label="Match on"
        onChange={(event) => handleChange(event.target.value)}
        MenuProps={{
          transitionDuration: 100,
          sx: { maxHeight: 400, maxWidth: 400 },
          MenuListProps: {
            disablePadding: true,
          },
        }}
      >
        <MenuItem
          disabled
          sx={{
            position: "sticky",
            top: 0,
            opacity: "1 !important",
            backgroundColor: "#fff !important",
            zIndex: 1,
            borderBottom: "2px solid",
            borderColor: "divider",
            "&:hover": {
              backgroundColor: "#fff !important",
            },
          }}
        >
          <Box
            display="flex"
            flexDirection="row"
            gap={1}
            width="100%"
            justifyContent={"space-between"}
            fontWeight="bold"
          >
            <Box sx={{ flexGrow: 1, width: "50%" }}>
              {isTableId(leftTableId) ? (
                <EnhancedTableLabel id={leftTableId} />
              ) : (
                <EnhancedOperationLabel id={leftTableId} />
              )}
            </Box>
            <Box sx={{ flexGrow: 1, width: "50%" }}>
              {isTableId(rightTableId) ? (
                <EnhancedTableLabel id={rightTableId} />
              ) : (
                <EnhancedOperationLabel id={rightTableId} />
              )}
            </Box>
          </Box>
        </MenuItem>
        {/* {hasUndefinedKey && (
          <MenuItem value="undefined" disabled>
            <Box
              display="flex"
              width="100%"
              justifyContent="flex-start"
              sx={{ color: "text.secondary", fontStyle: "italic" }}
            >
              Select columns to join
            </Box>
          </MenuItem>
        )} */}
        {options.map(([leftColumn, rightColumn]) => (
          <MenuItem
            key={`${leftColumn.id}|${rightColumn.id}`}
            value={`${leftColumn.id}|${rightColumn.id}`}
          >
            <Box
              display="flex"
              flexDirection="row"
              gap={1}
              mb={1}
              width="100%"
              justifyContent={"space-between"}
            >
              <EnhancedColumnMenuItemContent
                id={`${leftColumn.id}`}
                sx={{
                  flexGrow: 1,
                  width: "50%",
                }}
              />
              <EnhancedColumnMenuItemContent
                id={`${rightColumn.id}`}
                sx={{
                  flexGrow: 1,
                  width: "50%",
                }}
              />
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
export default JoinColumnsSelect;
