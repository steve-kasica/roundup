/**
 * @fileoverview StyledTableContainer Component
 *
 * A styled table container with full height and automatic vertical scrolling.
 * Provides a scrollable wrapper for table content.
 *
 * Features:
 * - Full height (100%)
 * - Automatic vertical overflow scrolling
 * - Theme integration
 *
 * @module components/ui/Table/StyledTableContainer
 *
 * @example
 * <StyledTableContainer>
 *   <Table>...</Table>
 * </StyledTableContainer>
 */

import { TableContainer } from "@mui/material";
import { styled } from "@mui/material/styles";

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  height: "100%",
  overflowY: "auto",
}));

export default StyledTableContainer;
