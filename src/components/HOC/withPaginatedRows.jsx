import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { getTableRows } from "../../lib/duckdb";

/**
 * Higher-Order Component for paginated database row querying
 *
 * @param {React.Component} WrappedComponent - The component to enhance with pagination
 * @param {Object} options - Configuration options
 * @param {number} options.pageSize - Number of rows per page (default: 25)
 * @param {number} options.scrollThreshold - Distance from bottom to trigger next page (default: 100)
 * @returns {React.Component} Enhanced component with pagination props
 */
export default function withPaginatedRows(WrappedComponent, options = {}) {
  const { pageSize = 25, scrollThreshold = 100 } = options;

  return function PaginatedComponent(props) {
    // Determine the actual ID to use for queries
    const { id, columnIds = [] } = props;
    const queryId = id;

    const activeColumnIds = useMemo(() => [...columnIds], [columnIds]);
    const activeColumnIdsRef = useRef(activeColumnIds);
    activeColumnIdsRef.current = activeColumnIds;

    // Pagination state
    const [rows, setRows] = useState([]);
    const [page, setPage] = useState(0);
    const [sortBy, setSortBy] = useState(null);
    const [sortDirection, setSortDirection] = useState("asc");
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState(null);
    const tableContainerRef = useRef(null);

    // Fetch rows for a given page
    const fetchRows = useCallback(
      async (pageNum) => {
        if (!queryId) return;

        setLoading(true);
        setError(null);

        try {
          const offset = pageNum * pageSize;
          const newRows = await getTableRows(
            queryId,
            activeColumnIds,
            pageSize,
            offset,
            sortBy,
            sortDirection
          );

          setRows((prevRows) => {
            const updatedRows =
              pageNum === 0 ? newRows : [...prevRows, ...newRows];
            return updatedRows;
          });

          // Check if we have more data
          if (newRows.length < pageSize) {
            setHasMore(false);
          }
        } catch (err) {
          setError(err);
          console.error("Error fetching rows:", err);
        } finally {
          setLoading(false);
        }
      },
      [queryId, sortBy, sortDirection, activeColumnIds]
    );

    // Reset pagination when ID or active columns change
    const resetPagination = useCallback(() => {
      setRows([]);
      setPage(0);
      setHasMore(true);
      setError(null);
    }, []);

    // Load next page
    const loadNextPage = useCallback(() => {
      if (!loading && hasMore) {
        setPage((prev) => prev + 1);
      }
    }, [loading, hasMore]);

    // Scroll handler for lazy loading
    const handleScroll = useCallback(() => {
      const container = tableContainerRef.current;
      if (!container || loading || !hasMore) return;

      const { scrollTop, scrollHeight, clientHeight } = container;

      // Load more rows when scrolled near the bottom
      if (scrollHeight - scrollTop - clientHeight < scrollThreshold) {
        loadNextPage();
      }
    }, [loading, hasMore, loadNextPage]);

    // Attach scroll listener
    useEffect(() => {
      const container = tableContainerRef.current;
      if (container) {
        container.addEventListener("scroll", handleScroll);
        return () => {
          container.removeEventListener("scroll", handleScroll);
        };
      }
    }, [handleScroll]);

    // Initial fetch or when dependencies change
    useEffect(() => {
      resetPagination();
      fetchRows(0);
    }, [queryId, fetchRows, resetPagination]);

    // Fetch next page when page changes (but not initial page)
    useEffect(() => {
      if (page === 0) return;
      fetchRows(page);
    }, [page, fetchRows]);

    const handleRefresh = useCallback((params = {}) => {
      const { sortBy: newSortBy, sortDirection: newSortDirection } = params;

      // If sorting parameters changed, reset pagination
      if (newSortBy !== undefined || newSortDirection !== undefined) {
        setSortBy(newSortBy);
        setSortDirection(newSortDirection);
        setRows([]);
        setPage(0);
        setHasMore(true);
      }
    }, []);

    // Enhanced props to pass to wrapped component
    const paginationProps = {
      // Data
      rows,
      rowsExplored: rows.length,

      // State
      loading,
      hasMore,
      error,
      page,

      // Actions
      fetchRows,
      resetPagination,
      loadNextPage,
      onRefresh: handleRefresh,
      sortBy,
      sortDirection,

      // Refs
      tableContainerRef,

      // Configuration
      pageSize,
      scrollThreshold,
    };

    return <WrappedComponent {...props} {...paginationProps} />;
  };
}

// /**
//  * Hook version for components that prefer hooks over HOCs
//  */
// export function usePaginatedRows(id, columnIds = [], options = {}) {
//   const { pageSize = 25, scrollThreshold = 100 } = options;

//   const [rows, setRows] = useState([]);
//   const [page, setPage] = useState(0);
//   const [loading, setLoading] = useState(false);
//   const [hasMore, setHasMore] = useState(true);
//   const [error, setError] = useState(null);
//   const tableContainerRef = useRef(null);

//   const activeColumnIds = useMemo(() => [...columnIds], [columnIds]);
//   const activeColumnIdsRef = useRef(activeColumnIds);
//   activeColumnIdsRef.current = activeColumnIds;

//   const fetchRows = useCallback(
//     async (pageNum) => {
//       const currentActiveColumnIds = activeColumnIdsRef.current;
//       if (!id) return;

//       setLoading(true);
//       setError(null);

//       try {
//         const offset = pageNum * pageSize;
//         const newRows = await getTableRows(
//           id,
//           currentActiveColumnIds,
//           pageSize,
//           offset
//         );

//         setRows((prevRows) => {
//           const updatedRows =
//             pageNum === 0 ? newRows : [...prevRows, ...newRows];
//           return updatedRows;
//         });

//         if (newRows.length < pageSize) {
//           setHasMore(false);
//         }
//       } catch (err) {
//         setError(err);
//         console.error("Error fetching rows:", err);
//       } finally {
//         setLoading(false);
//       }
//     },
//     [id, pageSize] // Remove activeColumnIds from deps
//   );

//   const resetPagination = useCallback(() => {
//     setRows([]);
//     setPage(0);
//     setHasMore(true);
//     setError(null);
//   }, []);

//   const loadNextPage = useCallback(() => {
//     if (!loading && hasMore) {
//       setPage((prev) => prev + 1);
//     }
//   }, [loading, hasMore]);

//   const handleScroll = useCallback(() => {
//     const container = tableContainerRef.current;
//     if (!container || loading || !hasMore) return;

//     const { scrollTop, scrollHeight, clientHeight } = container;

//     if (scrollHeight - scrollTop - clientHeight < scrollThreshold) {
//       loadNextPage();
//     }
//   }, [loading, hasMore, scrollThreshold, loadNextPage]);

//   useEffect(() => {
//     const container = tableContainerRef.current;
//     if (container) {
//       container.addEventListener("scroll", handleScroll);
//       return () => {
//         container.removeEventListener("scroll", handleScroll);
//       };
//     }
//   }, [handleScroll]);

//   useEffect(() => {
//     resetPagination();
//     fetchRows(0);
//   }, [id, fetchRows, resetPagination]);

//   useEffect(() => {
//     if (page === 0) return;
//     fetchRows(page);
//   }, [page, fetchRows]);

//   return {
//     rows,
//     rowsExplored: rows.length,
//     loading,
//     hasMore,
//     error,
//     page,
//     fetchRows,
//     resetPagination,
//     loadNextPage,
//     tableContainerRef,
//     pageSize,
//     scrollThreshold,
//   };
// }
