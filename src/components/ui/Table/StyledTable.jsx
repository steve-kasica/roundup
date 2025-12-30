/**
 * @fileoverview StyledTable Component
 *
 * A basic styled table component with auto layout and full width. Provides
 * consistent table styling as a foundation for more complex table implementations.
 *
 * Features:
 * - Full width (100%)
 * - Auto table layout
 * - Theme integration
 *
 * @module components/ui/Table/StyledTable
 *
 * @example
 * <StyledTable>
 *   <TableHead>...</TableHead>
 *   <TableBody>...</TableBody>
 * </StyledTable>
 */

import { styled } from "@mui/material/styles";
import { Table } from "@mui/material";

const StyledTable = styled(Table)(({ theme }) => ({
  width: "100%",
  tableLayout: "auto",
}));

export default StyledTable;
