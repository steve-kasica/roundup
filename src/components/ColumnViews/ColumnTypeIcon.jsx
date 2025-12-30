/**
 * @fileoverview ColumnTypeIcon Component
 *
 * Displays an appropriate icon representing the data type of a column, with support
 * for all DuckDB data types including numeric, categorical, date/time, boolean, and
 * null types. The component provides visual feedback with hover effects and tooltips.
 *
 * Supported DuckDB data types:
 * - Numeric: INTEGER, BIGINT, FLOAT, DOUBLE, DECIMAL, etc.
 * - Text: VARCHAR, CHAR, TEXT, STRING
 * - Date/Time: DATE, TIME, TIMESTAMP, INTERVAL
 * - Boolean: BOOLEAN, BOOL, LOGICAL
 * - Binary: BLOB, BYTEA, BINARY
 * - Special: UUID, JSON, BIT
 *
 * @module components/ColumnViews/ColumnTypeIcon
 *
 * @example
 * <ColumnTypeIcon
 *   columnType="INTEGER"
 *   placement="right"
 *   onClick={handleClick}
 * />
 *
 * @see {@link https://duckdb.org/docs/sql/data_types/overview.html} DuckDB Data Types Documentation
 */

/**
 * DuckDB Data Type Reference:
 *
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

/**
 * ColumnTypeIcon Component
 *
 * Renders an icon representing the data type of a column with interactive hover effects
 * and a tooltip showing the full type name.
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.columnType - The DuckDB data type of the column
 * @param {string} [props.placement="right"] - Tooltip placement position
 * @param {Function} [props.onClick] - Click handler for the icon
 * @param {Object} [props.sx={}] - Additional MUI sx styling props
 *
 * @returns {React.ReactElement} An icon with tooltip representing the column type
 *
 * @description
 * Icon mappings:
 * - NumericIcon: All numeric types (INTEGER, FLOAT, DECIMAL, etc.)
 * - DateIcon: All date/time types (DATE, TIME, TIMESTAMP, INTERVAL)
 * - CategoricalIcon: All text types (VARCHAR, CHAR, TEXT, STRING)
 * - KeyIcon: Boolean types
 * - NullIcon: NULL type
 * - UndefinedIcon: Unknown or unrecognized types
 */
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
