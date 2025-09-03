# withPaginatedRows HOC

A reusable Higher-Order Component (HOC) that provides paginated database row querying functionality with infinite scroll support.

## Features

- **Infinite Scroll Pagination** - Automatically loads more rows as user scrolls
- **Loading States** - Tracks loading, error, and completion states
- **Flexible Configuration** - Configurable page size and scroll threshold
- **Error Handling** - Graceful error handling with error state
- **Memory Efficient** - Only loads data as needed
- **Hook Alternative** - Also provides a `usePaginatedRows` hook version

## Usage

### HOC Pattern

```jsx
import withPaginatedRows from "../HOC/withPaginatedRows";
import { formatNumber } from "../../lib/utilities";

function MyTableComponent({
  // Your original props
  table,
  activeColumnIds,
  onClose,
  // Props provided by HOC
  rows,
  rowsExplored,
  loading,
  hasMore,
  error,
  tableContainerRef,
}) {
  return (
    <div>
      <h2>
        {table.name} ({formatNumber(rowsExplored)} rows loaded)
      </h2>

      {error && <div className="error">Error: {error.message}</div>}

      <div
        ref={tableContainerRef}
        style={{ height: "400px", overflow: "auto" }}
      >
        <table>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {loading && <div>Loading...</div>}
        {!hasMore && <div>End of data</div>}
      </div>
    </div>
  );
}

// Enhance with pagination
const EnhancedTable = withPaginatedRows(MyTableComponent, {
  pageSize: 50,
  scrollThreshold: 150,
});

export default EnhancedTable;
```

### Hook Pattern

```jsx
import { usePaginatedRows } from "../HOC/withPaginatedRows";

function MyTableComponent({ table, activeColumnIds }) {
  const {
    rows,
    rowsExplored,
    loading,
    hasMore,
    error,
    tableContainerRef,
    loadNextPage,
    resetPagination,
  } = usePaginatedRows(table.id, activeColumnIds, {
    pageSize: 25,
    scrollThreshold: 100,
  });

  return (
    <div>
      <button onClick={resetPagination}>Reset</button>
      <button onClick={loadNextPage} disabled={loading || !hasMore}>
        Load More
      </button>

      <div
        ref={tableContainerRef}
        style={{ height: "400px", overflow: "auto" }}
      >
        {/* Your table content */}
      </div>
    </div>
  );
}
```

## Configuration Options

| Option            | Type     | Default | Description                                         |
| ----------------- | -------- | ------- | --------------------------------------------------- |
| `pageSize`        | `number` | `25`    | Number of rows to fetch per page                    |
| `scrollThreshold` | `number` | `100`   | Distance from bottom (px) to trigger next page load |

## Props Provided by HOC

### Data Props

- `rows` - Array of fetched row data
- `rowsExplored` - Total number of rows loaded so far

### State Props

- `loading` - Whether a fetch operation is in progress
- `hasMore` - Whether more data is available to load
- `error` - Error object if fetch failed
- `page` - Current page number

### Action Props

- `fetchRows(pageNum)` - Manually fetch specific page
- `resetPagination()` - Reset to initial state
- `loadNextPage()` - Load next page manually

### Ref Props

- `tableContainerRef` - Ref to attach to scrollable container

### Config Props

- `pageSize` - Configured page size
- `scrollThreshold` - Configured scroll threshold

## Requirements

Your component must:

1. Accept either `id` prop or `table`/`operation` props with `.id` property
2. Accept `activeColumnIds` prop (can be empty array)
3. Attach `tableContainerRef` to your scrollable container
4. Handle `loading`, `error`, and empty states appropriately

## Database Integration

The HOC uses `getTableRows(id, activeColumnIds, pageSize, offset)` from your DuckDB utilities. Ensure this function:

- Returns array of row data
- Supports offset/limit pagination
- Handles column filtering via `activeColumnIds`
- Throws errors that can be caught by the HOC

## Performance Tips

- Use `pageSize: 50-100` for good balance of performance and UX
- Set `scrollThreshold: 100-200` to trigger loading before user reaches bottom
- Consider implementing virtual scrolling for very large datasets
- Use `resetPagination()` when table/filters change
