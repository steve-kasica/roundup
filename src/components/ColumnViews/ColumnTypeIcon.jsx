/**
 * Name                       Description                                 Alias
 * ------------------------   -----------------------------------------   ------------------------------
 * BOOLEAN	                  Logical Boolean (true/false)	              BOOL, LOGICAL
 * TINYINT	                  Signed one-byte integer	                    INT1
 * SMALLINT	                  Signed two-byte integer	                    INT2, SHORT
 * INTEGER	                  Signed four-byte integer	                  INT4, INT, SIGNED
 * BIGINT	                    Signed eight-byte integer	                  INT8, LONG
 * HUGEINT	                  Signed sixteen-byte integer
 * UTINYINT	                  Unsigned one-byte integer
 * USMALLINT	                Unsigned two-byte integer
 * UINTEGER	                  Unsigned four-byte integer
 * UBIGINT	                  Unsigned eight-byte integer
 * UHUGEINT	                  Unsigned sixteen-byte integer
 * BIGNUM	                    Variable-length integer
 * FLOAT	                    Single precision floating-point (4 bytes)	  FLOAT4, REAL
 * DOUBLE	                    Double precision floating-point (8 bytes)	  FLOAT8
 * DECIMAL	                  Fixed-precision number	                    NUMERIC
 * VARCHAR	                  Variable-length character string	          CHAR, BPCHAR, TEXT, STRING
 * BLOB	                      Variable-length binary data	                BYTEA, BINARY, VARBINARY
 * BIT	                      String of 1s and 0s	                        BITSTRING
 * DATE	                      Calendar date
 * TIME	                      Time of day
 * TIMESTAMP	                Combination of time and date	              DATETIME
 * TIMESTAMP WITH TIME ZONE	  Timestamp that uses the current time zone	  TIMESTAMPTZ
 * INTERVAL	                  Date/time delta
 * UUID	                      UUID data type
 * JSON	                      JSON object (via the json extension)
 */

import {
  Abc as CategoricalIcon,
  Numbers as NumericIcon,
  CalendarMonth as DateIcon,
  Key as KeyIcon,
  QuestionMark as UndefinedIcon,
  DoNotDisturb as NullIcon,
} from "@mui/icons-material";
import { Tooltip } from "@mui/material";

export default function ColumnTypeIcon({
  columnType,
  placement = "right",
  onClick = () => {},
  sx: customSx = {},
}) {
  let Icon;
  let tooltipText = "";
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
  switch (columnType) {
    case "BOOLEAN":
    case "BOOL":
    case "LOGICAL":
      Icon = KeyIcon;
      tooltipText = "Column Type: Boolean";
      break;
    case "TINYINT":
    case "INT1":
    case "INT2":
    case "SHORT":
    case "INT4":
    case "INT":
    case "SIGNED":
    case "INT8":
    case "LONG":
    case "SMALLINT":
    case "INTEGER":
    case "BIGINT":
    case "HUGEINT":
    case "UTINYINT":
    case "USMALLINT":
    case "UINTEGER":
    case "UBIGINT":
    case "UHUGEINT":
    case "BIGNUM":
    case "FLOAT":
    case "DOUBLE":
    case "DECIMAL":
      Icon = NumericIcon;
      tooltipText = "Column Type: Quantitative";
      break;
    case "VARCHAR":
      Icon = CategoricalIcon;
      tooltipText = "Column Type: Categorical";
      break;
    case "DATE":
      Icon = DateIcon;
      tooltipText = "Column Type: Date";
      break;
    default:
      Icon = UndefinedIcon;
      tooltipText = "Unknown column type: " + columnType;
  }

  // Merge custom sx with default sx (custom sx takes precedence)
  const mergedSx = { ...defaultSx, ...customSx };

  return (
    <Tooltip title={tooltipText} placement={placement} arrow>
      <Icon sx={mergedSx} onClick={onClick} />
    </Tooltip>
  );
}
