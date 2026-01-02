# Hooks Module

This module provides custom React hooks for data fetching, state management, and DuckDB interactions. Hooks abstract away the complexity of querying DuckDB and integrating with Redux state.

## Purpose

The hooks module centralizes:

- Data fetching from DuckDB with loading/error states
- Pagination and infinite scrolling support
- Redux state integration for metadata resolution
- Drag-and-drop functionality

## Architecture

All data-fetching hooks follow a consistent pattern:

```javascript
const { data, loading, error, refetch, reset } = useHookName(
  ...parameters,
  (autoFetch = true)
);
```

| Return Value | Type          | Description                           |
| ------------ | ------------- | ------------------------------------- |
| `data`       | varies        | Fetched data (array, object, or null) |
| `loading`    | boolean       | Whether a fetch is in progress        |
| `error`      | Error \| null | Error if fetch failed                 |
| `refetch`    | function      | Manually trigger a new fetch          |
| `reset`      | function      | Reset to initial state                |

## Hooks Overview

### Data Fetching Hooks

| Hook                    | Description                                         |
| ----------------------- | --------------------------------------------------- |
| `useColumnValues`       | Fetch column values from a table                    |
| `useTableRowData`       | Fetch table rows with sorting                       |
| `usePaginatedTableRows` | Paginated table rows for infinite scroll            |
| `useValueCounts`        | Fetch value frequency distribution                  |
| `useValueLength`        | Fetch string length distribution                    |
| `useValueMatrixData`    | Fetch values across multiple columns for comparison |

### Join/Pack Hooks

| Hook                 | Description                                           |
| -------------------- | ----------------------------------------------------- |
| `useMatchValues`     | Fetch match values between joined tables              |
| `usePackStats`       | Calculate join statistics (match counts, cardinality) |
| `useVirtualPackRows` | Fetch paginated joined rows by match type             |

### Stack Hooks

| Hook                  | Description                          |
| --------------------- | ------------------------------------ |
| `useVirtualStackRows` | Fetch paginated stacked (UNION) rows |

### Interaction Hooks

| Hook             | Description                          |
| ---------------- | ------------------------------------ |
| `useDragAndDrop` | Combined drag-and-drop functionality |

---

## Hook Details

### useColumnValues

Fetches column values from DuckDB with pagination support.

```javascript
const { data, loading, error, refetch, reset } = useColumnValues(
  tableId, // Table or operation ID
  databaseName, // Column database name
  limit, // Max values to fetch (null for all)
  offset, // Offset for pagination
  autoFetch // Auto-fetch on mount (default: true)
);
```

**Returns:** `data` is an array of column values.

---

### useTableRowData

Fetches table rows with sorting and column selection.

```javascript
const { data, loading, error, refetch, reset } = useTableRowData(
  tableId, // Table or operation ID
  columnsList, // Array of column names (null for all)
  limit, // Max rows (default: 50)
  offset, // Offset for pagination
  sortBy, // Column to sort by
  sortDirection, // 'asc' or 'desc'
  autoFetch // Auto-fetch on mount (default: true)
);
```

**Returns:** `data` is an array of row objects.

---

### usePaginatedTableRows

Paginated version of `useTableRowData` for infinite scrolling.

```javascript
const { data, loading, error, hasMore, loadMore, refresh, reset } =
  usePaginatedTableRows(tableId, columnsList, pageSize, sortBy, sortDirection);
```

**Additional Returns:**

- `hasMore`: Whether more data is available
- `loadMore`: Function to load next page
- `refresh`: Reset and reload from page 0

---

### useValueCounts

Fetches value frequency distribution for a column.

```javascript
const { data, loading, error, refetch, reset } = useValueCounts(
  tableId,
  databaseName,
  limit,
  offset,
  autoFetch
);
```

**Returns:** `data` is an object mapping values to counts: `{ "value1": 10, "value2": 5, ... }`

---

### useValueLength

Fetches string length distribution for a column.

```javascript
const { data, loading, error, refetch, reset } = useValueLength(
  tableId,
  columnName,
  limit,
  offset,
  autoFetch
);
```

**Returns:** `data` is an array of `{ length, count, examples }` objects.

---

### useValueMatrixData

Fetches value counts across multiple columns for comparison views (e.g., UpSet plots).

```javascript
const { data, uniqueValues, valueDegrees, loading, error, refetch, reset } =
  useValueMatrixData(
    columnIds, // Array of column IDs to compare
    autoFetch
  );
```

**Returns:**

- `data`: Grouped value data
- `uniqueValues`: Unique values across all columns
- `valueDegrees`: Degree of each value (how many columns contain it)

---

### useMatchValues

Fetches match values between two tables in a join operation.

```javascript
const { data, loading, error, refetch } = useMatchValues(
  leftTableId,
  rightTableId,
  leftColumnName,
  rightColumnName,
  joinPredicate, // 'EQUALS', 'CONTAINS', 'STARTS_WITH', 'ENDS_WITH'
  matchType, // 'MATCHES', 'LEFT_UNJOINED', 'RIGHT_UNJOINED'
  options // { limit, order, orderDirection, enabled }
);
```

**Returns:** `data` is an array of match records with counts.

---

### usePackStats

Calculates PACK (join) statistics including match counts and cardinality breakdown.

```javascript
const { data, loading, error, refetch, reset } = usePackStats(
  leftColumnId,
  rightColumnId,
  joinType, // 'EQUALS', 'CONTAINS', etc.
  autoFetch
);
```

**Returns:** `data` contains:

- `left_unjoined`: Count of unmatched left rows
- `right_unjoined`: Count of unmatched right rows
- `one_to_one_matches`: One-to-one match count
- `many_to_many_matches`: Many-to-many match count

---

### useVirtualPackRows

Fetches joined rows filtered by match type with pagination.

```javascript
const { data, loading, error, hasMore, currentPage, loadMore, refresh, reset } =
  useVirtualPackRows(
    leftTableId,
    rightTableId,
    leftColumnIds,
    rightColumnIds,
    leftKeyColumnId,
    rightKeyColumnId,
    joinPredicate,
    matchSelection, // Array of match types to include
    pageSize
  );
```

**Match Types:**

- `MATCH_TYPE_MATCHES`: Rows that matched
- `MATCH_TYPE_LEFT_UNMATCHED`: Left rows without matches
- `MATCH_TYPE_RIGHT_UNMATCHED`: Right rows without matches

---

### useVirtualStackRows

Fetches stacked (UNION ALL) rows from multiple tables with pagination.

```javascript
const { data, loading, error, hasMore, currentPage, loadMore, refresh, reset } =
  useVirtualStackRows(
    tableIds, // Array of table IDs
    databaseNameMatrix, // 2D array mapping columns per table
    pageSize,
    sortBy, // Column index to sort by
    sortDirection
  );
```

**Database Name Matrix:**
Maps columns across tables. Use `null` for columns that don't exist in a table:

```javascript
[
  ["id", "name", null], // Table 1: has id, name
  ["id", null, "email"], // Table 2: has id, email
];
```

---

### useDragAndDrop

Unified drag-and-drop hook combining react-dnd drag and drop.

```javascript
const { drag, drop, isDragging, isOver, canDrop } = useDragAndDrop({
  dragType, // Drag type identifier
  dropType, // Drop type(s) to accept
  getDragItem, // Function returning drag item data
  canDrag, // Predicate for drag permission
  canDrop, // Predicate for drop permission
  onDrop, // Drop handler callback
  onDragStart, // Drag start callback
  onDragEnd, // Drag end callback
  hideDefaultPreview, // Hide browser's default drag preview
});
```

**Returns:**

- `drag`: Ref to attach to draggable element
- `drop`: Ref to attach to drop target
- `isDragging`: Whether this element is being dragged
- `isOver`: Whether a dragged item is over this target
- `canDrop`: Whether the current item can be dropped here

---

## Integration with Redux

Most hooks integrate with Redux to resolve metadata:

1. Accept IDs (tableId, columnId, operationId) as parameters
2. Use selectors to fetch metadata from Redux state
3. Resolve database names for DuckDB queries
4. Handle both tables and operations via `isTableId()` checks

```javascript
// Inside a hook
const table = useSelector((state) =>
  isTableId(parentId)
    ? selectTablesById(state, parentId)
    : selectOperationsById(state, parentId)
);
```

---

## Files

| File                     | Description                        |
| ------------------------ | ---------------------------------- |
| `index.js`               | Barrel exports for public hooks    |
| `useColumnValues.js`     | Column value fetching              |
| `useTableRowData.js`     | Table row fetching with pagination |
| `useDragAndDrop.js`      | Drag-and-drop functionality        |
| `useMatchValues.js`      | Join match value queries           |
| `usePackStats.js`        | Join statistics calculation        |
| `useValueCounts.js`      | Value frequency distribution       |
| `useValueLength.js`      | String length distribution         |
| `useValueMatrixData.js`  | Multi-column value comparison      |
| `useVirtualPackRows.js`  | Paginated joined rows              |
| `useVirtualStackRows.js` | Paginated stacked rows             |
