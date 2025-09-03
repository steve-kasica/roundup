import PropTypes from "prop-types";
import { TableCell, Box, Typography, IconButton } from "@mui/material";
import { ArrowUpward, ArrowDownward, UnfoldMore } from "@mui/icons-material";
import withColumnData from "../../HOC/withColumnData";

const ColumnHeader = ({ column, sortBy, sortDirection, onSort, index = 0 }) => {
  const handleSort = () => {
    if (!onSort) return;

    let newDirection = "asc";

    // If this column is already sorted, toggle direction
    if (sortBy === column.id) {
      newDirection = sortDirection === "asc" ? "desc" : "asc";
    }

    onSort(column.id, newDirection);
  };

  const getSortIcon = () => {
    if (sortBy !== column.id) {
      return <UnfoldMore fontSize="small" />;
    }

    return sortDirection === "asc" ? (
      <ArrowUpward fontSize="small" />
    ) : (
      <ArrowDownward fontSize="small" />
    );
  };

  const getSortIconColor = () => {
    return sortBy === column.id ? "primary" : "disabled";
  };

  return (
    <TableCell
      sx={{
        fontWeight: 600,
        backgroundColor: "grey.50",
        minWidth: 120,
        whiteSpace: "nowrap",
        cursor: onSort ? "pointer" : "default",
        userSelect: "none",
        "&:hover": onSort
          ? {
              backgroundColor: "grey.100",
            }
          : {},
      }}
      onClick={handleSort}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 600,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            flex: 1,
          }}
        >
          {column.name || `Column ${index}`}
        </Typography>

        {onSort && (
          <IconButton
            size="small"
            sx={{
              p: 0.25,
              color: getSortIconColor(),
              "&:hover": {
                backgroundColor: "transparent",
              },
            }}
            disableRipple
          >
            {getSortIcon()}
          </IconButton>
        )}
      </Box>

      {/* Column type indicator */}
      {column.type && (
        <Typography
          variant="caption"
          sx={{
            color: "text.secondary",
            fontSize: "0.7rem",
            display: "block",
            lineHeight: 1,
          }}
        >
          {column.type}
        </Typography>
      )}
    </TableCell>
  );
};

ColumnHeader.propTypes = {
  column: PropTypes.shape({
    name: PropTypes.string,
    column_name: PropTypes.string,
    type: PropTypes.string,
  }).isRequired,
  sortBy: PropTypes.string,
  sortDirection: PropTypes.oneOf(["asc", "desc"]),
  onSort: PropTypes.func,
};

const EnhancedColumnHeader = withColumnData(ColumnHeader);
export default EnhancedColumnHeader;
