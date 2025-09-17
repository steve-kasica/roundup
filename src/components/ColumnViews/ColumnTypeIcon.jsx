/* eslint-disable react/prop-types */
import {
  Abc as CategoricalIcon,
  Numbers as NumericIcon,
  CalendarMonth as DateIcon,
  Key as KeyIcon,
  QuestionMark as UndefinedIcon,
} from "@mui/icons-material";
import { Tooltip } from "@mui/material";
import { COLUMN_TYPE_VARCHAR } from "../../slices/columnsSlice";

export default function ColumnTypeIcon({
  column,
  placement = "right",
  onClick = () => {},
  sx: customSx = {},
}) {
  if (!column) return null;
  const { columnType, uniqueValues, nonNullValues } = column;
  const isKey = uniqueValues === nonNullValues;
  const defaultSx = {
    color: "gray.300",
    fontSize: "1.5rem",
    cursor: "pointer",
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      color: "primary.main",
      transform: "scale(1.1)",
      filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
    },
    "&:active": {
      transform: "scale(0.95)",
    },
  };

  let Icon;
  let tooltipText = "";

  if (columnType === undefined) {
    Icon = UndefinedIcon;
    tooltipText = "Unknown column type";
  } else if (columnType === COLUMN_TYPE_VARCHAR && isKey) {
    Icon = KeyIcon;
    defaultSx["fontSize"] = "1rem";
    tooltipText = "Key column (unique text)";
  } else if (columnType === COLUMN_TYPE_VARCHAR) {
    Icon = CategoricalIcon;
    tooltipText = "Text column";
  } else if (columnType === "NUMERIC") {
    Icon = NumericIcon;
    tooltipText = "Numeric column";
  } else if (columnType === "DATE") {
    Icon = DateIcon;
    tooltipText = "Date column";
  }

  // Merge custom sx with default sx (custom sx takes precedence)
  const mergedSx = { ...defaultSx, ...customSx };

  return (
    <Tooltip title={tooltipText} placement={placement} arrow>
      <Icon sx={mergedSx} onClick={onClick} />
    </Tooltip>
  );
}
