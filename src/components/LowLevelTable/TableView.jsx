import { useEffect, useRef } from "react";
import { Box, Typography } from "@mui/material";
import withPaginatedRows from "../HOC/withPaginatedRows";

const rowHeight = 25; // in px

function TableView({
  rows,
  rowsExplored,

  // State
  loading,
  hasMore,
  error,
  page,

  // Props passed directly from ./StackOperationView.jsx
  coordinatedScrollTop,
  onCoordinatedScroll,
  rowsPerTable,
  ...props
}) {
  const containerRef = useRef(null);

  // Set scroll position when coordinatedScrollTop changes
  useEffect(() => {
    if (containerRef.current && typeof coordinatedScrollTop === "number") {
      containerRef.current.scrollTop = coordinatedScrollTop;
    }
  }, [coordinatedScrollTop]);

  // Notify parent when scrolled and trigger lazy loading
  const handleScroll = (e) => {
    if (onCoordinatedScroll) {
      onCoordinatedScroll(e.target.scrollTop);
    }
    // Lazy load: fetch next page if near bottom
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (
      scrollHeight - scrollTop - clientHeight < rowHeight * 2 &&
      !loading &&
      hasMore &&
      typeof props.loadNextPage === "function"
    ) {
      props.loadNextPage();
    }
  };

  return (
    <Box
      ref={containerRef}
      sx={{
        maxHeight: `${rowsPerTable * rowHeight}px`,
        overflowY: "auto",
        mb: 1,
        border: "2px solid #bbb",
        background: "#fafbfc",
      }}
      onScroll={handleScroll}
    >
      {rows.map((row, idx) => (
        <Box
          key={idx}
          sx={{
            display: "flex",
            height: `${rowHeight}px`,
            backgroundColor: idx % 2 === 0 ? "#f9f9f9" : "#fff",
            borderBottom: "1px solid #eee",
            borderTop: idx === 0 ? "1px solid #ddd" : "none",
          }}
        >
          {Object.values(row).map((val, i) => (
            <Box
              key={i}
              sx={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRight:
                  i < Object.values(row).length - 1 ? "1px solid #eee" : "none",
                borderLeft: i === 0 ? "none" : undefined,
              }}
            >
              <Typography component="div">{val}</Typography>
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  );
}

const EnhancedTableView = withPaginatedRows(TableView);

export default EnhancedTableView;
