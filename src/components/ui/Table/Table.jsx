import React, { useCallback } from "react";
import { Alert, CircularProgress } from "@mui/material";
import StyledTableContainer from "./StyledTableContainer";
import StyledTable from "./StyledTable";
import MaterializeViewIconButton from "../MaterializeViewIconButton";
import RoundupTableBody from "./TableBody";
import RoundupTableHead from "./TableHead";

const placeholderColumnCount = 10;

const Table = ({
  columnIds,
  data,
  loading,
  error,
  // handleScroll,
  onScrollThreshold,
  onColumnSort,
  sortConfig,
  errorCount,
  rowMargin = (_rowData, index) => `${index + 1}`,
  hasMore = true,

  // Props specific to operation tables, and are not passed
  // when the operation is a table
  isMaterialized = true,
  isInSync = true,
  onMaterializeView = () => null,
}) => {
  const tableContainerRef = React.useRef(null);
  const handleScroll = useCallback(
    (event) => {
      // return null;
      const container = event.target;
      const { scrollTop, scrollHeight, clientHeight } = container;

      // Check if user has scrolled near the bottom (within 100px)
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;

      // if (isNearBottom && hasMore && !loading && !error) {
      //   loadMore();
      // }
      if (isNearBottom) {
        onScrollThreshold();
      }
    },
    [onScrollThreshold]
  );
  return (
    <>
      {errorCount > 0 ? (
        <Alert severity="error" sx={{ borderBottom: "1px solid #ccc" }}>
          This operation has critical schema-related errors that prevent
          materialization.
        </Alert>
      ) : loading && data.length === 0 ? (
        <Alert
          severity="info"
          sx={{ borderBottom: "1px solid #ccc" }}
          action={<CircularProgress size={16} />}
        >
          Loading table data...
        </Alert>
      ) : !isMaterialized ? (
        <Alert
          severity="warning"
          sx={{ borderBottom: "1px solid #ccc" }}
          action={<MaterializeViewIconButton onClick={onMaterializeView} />}
        >
          This operation is not materialized. Please materialize to view data.
        </Alert>
      ) : !isInSync ? (
        <Alert
          severity="warning"
          sx={{ borderBottom: "1px solid #ccc" }}
          action={<MaterializeViewIconButton onClick={onMaterializeView} />}
        >
          This operation is out of sync. Re-materialize to view updated data.
        </Alert>
      ) : columnIds.length === 0 ? (
        <Alert severity="info" sx={{ borderBottom: "1px solid #ccc" }}>
          No columns selected. Please select columns to display data.
        </Alert>
      ) : error ? (
        <Alert severity="error" sx={{ borderBottom: "1px solid #ccc" }}>
          Error loading table data: {error?.message || "Unknown error"}
        </Alert>
      ) : null}
      <StyledTableContainer ref={tableContainerRef} onScroll={handleScroll}>
        <StyledTable size="small" stickyHeader>
          {/* Table Header - Sortable column headers with hover effects */}
          <RoundupTableHead
            loading={loading}
            columnIds={columnIds}
            placeholderColumnCount={placeholderColumnCount}
            sortConfig={sortConfig}
            onColumnSort={onColumnSort}
            rowMargin={rowMargin}
          />

          {/* Table Body - Data rows with loading, error, and pagination states */}
          <RoundupTableBody
            columnIds={columnIds}
            loading={loading}
            data={data}
            error={error}
            isInSync={isInSync}
            rowMargin={rowMargin}
            hasMore={hasMore}
            placeholderColumnCount={placeholderColumnCount}
          />
        </StyledTable>
      </StyledTableContainer>
    </>
  );
};

export default Table;
