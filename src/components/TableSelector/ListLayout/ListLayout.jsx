/**
 * ListLayout.jsx
 *
 * An unordered list layout for tables when the sidebar is collapsed to
 * a specific width.
 */
import {
  Divider,
  List,
  Box,
  CircularProgress,
  Typography,
  Alert,
  ListItem,
  Skeleton,
} from "@mui/material";
import { ErrorOutline, TableChart } from "@mui/icons-material";
import TableView from "./TableView";
import withAllTablesData from "../../HOC/withAllTablesData";
import PropTypes from "prop-types";

export const LAYOUT_ID = "list";

function ListLayout({
  searchString,
  tables,
  loading,
  error,
  selectedTableIds = [],
  schemaTableIds = [],
  onTableSelect,
  onTableHover,
  onTableUnhover,
}) {
  // Loading state
  if (loading) {
    return (
      <Box
        sx={{
          height: "inherit",
          display: "flex",
          flexDirection: "column",
          gap: 1,
          p: 2,
        }}
      >
        {/* Loading header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            mb: 2,
          }}
        >
          <CircularProgress size={20} />
          <Typography variant="body2" color="text.secondary">
            Loading tables...
          </Typography>
        </Box>

        {/* Loading skeleton items */}
        <List dense>
          {Array.from({ length: 5 }).map((_, index) => (
            <Box key={index}>
              <ListItem disablePadding>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                    p: 1,
                  }}
                >
                  <Skeleton
                    variant="rectangular"
                    width={16}
                    height={16}
                    sx={{ mr: 1, borderRadius: 0.5 }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="60%" height={20} />
                    <Skeleton variant="text" width="40%" height={16} />
                    <Skeleton variant="text" width="80%" height={14} />
                  </Box>
                </Box>
              </ListItem>
              {index < 4 && <Divider component="li" />}
            </Box>
          ))}
        </List>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box
        sx={{
          height: "inherit",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          p: 3,
          textAlign: "center",
        }}
      >
        <ErrorOutline
          sx={{
            fontSize: 48,
            color: "error.main",
            mb: 2,
          }}
        />
        <Typography variant="h6" color="error.main" gutterBottom>
          Failed to Load Tables
        </Typography>
        <Alert severity="error" sx={{ mt: 2, maxWidth: 400 }}>
          <Typography variant="body2">
            {error?.message ||
              "An unexpected error occurred while loading tables."}
          </Typography>
        </Alert>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Please try refreshing the page or contact support if the problem
          persists.
        </Typography>
      </Box>
    );
  }

  // Empty state
  if (!tables || tables.length === 0) {
    return (
      <Box
        sx={{
          height: "inherit",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          p: 3,
          textAlign: "center",
        }}
      >
        <TableChart
          sx={{
            fontSize: 48,
            color: "text.secondary",
            mb: 2,
          }}
        />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No Tables Found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {searchString
            ? `No tables match your search for "${searchString}"`
            : "No tables are available in this workspace"}
        </Typography>
      </Box>
    );
  }

  // Normal state with data
  return (
    <List
      className="list-layout"
      dense
      sx={{
        height: "inherit",
        overflowY: "auto",
        "&::-webkit-scrollbar": {
          width: 8,
        },
        "&::-webkit-scrollbar-track": {
          backgroundColor: "grey.100",
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "grey.400",
          borderRadius: 4,
        },
      }}
    >
      {tables
        .toSorted((tableA, tableB) => {
          const [a, b] = [
            tableA.name.toLowerCase().includes(searchString.toLowerCase()),
            tableB.name.toLowerCase().includes(searchString.toLowerCase()),
          ];
          return a === b ? 0 : a < b ? 1 : -1;
        })
        .map((sourceTable, i) => (
          <Box key={sourceTable.id}>
            <TableView
              id={sourceTable.id}
              isDraggable={true}
              searchString={searchString}
              // isSelected={selectedTableIds.includes(sourceTable.id)}
              // isInSchema={schemaTableIds.includes(sourceTable.id)}
              // onSelect={(event) => onTableSelect?.(sourceTable.id, event)}
              // onHover={() => onTableHover?.(sourceTable.id)}
              // onUnhover={() => onTableUnhover?.(sourceTable.id)}
            />
            {i < tables.length - 1 && <Divider component="li" />}
          </Box>
        ))}
    </List>
  );
} // end ListLayout()

ListLayout.propTypes = {
  searchString: PropTypes.string.isRequired,
  tables: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
  loading: PropTypes.bool,
  error: PropTypes.any,
  selectedTableIds: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  ),
  schemaTableIds: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  ),
  onTableSelect: PropTypes.func,
  onTableHover: PropTypes.func,
  onTableUnhover: PropTypes.func,
};

const EnhancedListLayout = withAllTablesData(ListLayout);
export default EnhancedListLayout;
