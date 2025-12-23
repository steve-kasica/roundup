/* eslint-disable react/prop-types */
import { IconButton, Menu, TableSortLabel } from "@mui/material";
// import EditableText from "../ui/EditableText";
import { useCallback, useState } from "react";
import { MoreVert } from "@mui/icons-material";
import { withColumnData, withAssociatedAlerts } from "../HOC";
import { EnhancedColumnName } from "./ColumnName";
import { EnhancedColumnContextMenuItems } from "./ColumnContextMenuItems";
import StyledColumnCard from "./StyledColumnCard";
import ColumnTypeIcon from "./ColumnTypeIcon";

const ColumnHeader = ({
  // Props pass via withColumnData HOC
  id,
  columnType,
  isHovered,
  isDragging,
  isDropTarget,
  isSelected,
  isOver,
  isLoading,
  isFocused,
  isDraggable,
  // Props pased from `withAssociatedAlerts` via `withColumnData` HOC
  totalCount,
  // Props passed directly from parent
  isActive,
  onSort,
  sortDirection,
}) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const isMenuOpen = Boolean(menuAnchorEl);

  // Handle context menu
  const handleMenuOpen = useCallback((event) => {
    event.stopPropagation(); // Prevent sort handler from firing
    setMenuAnchorEl(event.currentTarget);
  }, []);

  const handleMenuClose = useCallback(() => {
    setMenuAnchorEl(null);
  }, []);

  // Handle column sorting
  const handleSort = useCallback(
    (event) => {
      onSort(event, id);
    },
    [onSort, id]
  );

  return (
    <>
      <StyledColumnCard
        isHovered={isHovered}
        isDragging={isDragging}
        isDropTarget={isDropTarget}
        isSelected={isSelected}
        isOver={isOver}
        isLoading={isLoading}
        isFocused={isFocused}
        isDraggable={isDraggable}
        isError={totalCount}
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          borderRadius: 0,
          ...(totalCount && {
            backgroundColor: "warning.light",
            borderBottom: "2px solid",
            borderBottomColor: "warning.main",
          }),
        }}
      >
        {/* <Box display="flex" alignItems="center" justifyContent="space-between"> */}
        <TableSortLabel
          active={isActive}
          direction={isActive ? sortDirection : "asc"}
          onClick={handleSort}
          sx={{
            cursor: "pointer",
            flex: 1,
            "& .MuiTableSortLabel-icon": {
              opacity: isActive ? 1 : 0, // icon completely when not sorting
            },
            "&:hover .MuiTableSortLabel-icon": {
              opacity: isActive ? 1 : 0.6, // Show faded icon on hover
            },
          }}
        >
          <EnhancedColumnName id={id} sx={{ cursor: "inherit" }} />
          <ColumnTypeIcon columnType={columnType} sx={{ ml: 1 }} />
        </TableSortLabel>
        <IconButton
          size="small"
          onClick={(event) => handleMenuOpen(event, id)}
          sx={{
            ml: 1,
            opacity: 0.6,
            "&:hover": {
              opacity: 1,
            },
          }}
        >
          <MoreVert fontSize="small" />
        </IconButton>
        {/* </Box> */}
      </StyledColumnCard>
      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={isMenuOpen}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <EnhancedColumnContextMenuItems
          id={id}
          closeMenu={handleMenuClose}
          includeInsert={false}
        />
      </Menu>
    </>
  );
};

ColumnHeader.displayName = "ColumnHeader";

const EnhancedColumnHeader = withAssociatedAlerts(withColumnData(ColumnHeader));

EnhancedColumnHeader.displayName = "EnhancedColumnHeader";

export { EnhancedColumnHeader, ColumnHeader };
