/**
 * @fileoverview TableName Component
 *
 * A simple text display component for rendering table names with consistent typography
 * and styling. Integrates with the withTableData HOC to access table metadata and
 * provides a standardized name display across the application.
 *
 * Features:
 * - Typography-based name display
 * - Customizable sx prop for styling overrides
 * - Integration with table data HOC
 * - Consistent text formatting
 *
 * @module components/TableView/TableName
 *
 * @example
 * <EnhancedTableName id={tableId} sx={{ fontWeight: 'bold' }} />
 */

/* eslint-disable react/prop-types */
import { Typography } from "@mui/material";
import { withTableData } from "../HOC";

const TableName = ({ name, sx = {} }) => {
  return (
    <Typography
      variant="data-small"
      component="div"
      sx={sx}
    >
      {name}
    </Typography>
  );
};

TableName.displayName = "TableName";

const EnhancedTableName = withTableData(TableName);

EnhancedTableName.displayName = "EnhancedTableName";

export { TableName, EnhancedTableName };
