# Tables Slice

This module manages table metadata in the global data state. Tables represent uploaded data files and store metadata about file sources, row counts, and column references.

## Files

- `Table.js`: A serializable factory function for creating table objects intended for Redux storage.
- `tablesSlice.js`: Redux slice with normalized state structure (`byId`/`allIds`).
- `selectors.js`: Memoized selectors for accessing table data.

## State Structure

```javascript
{
  allIds: ['t1', 't2', ...],  // Array of all table IDs
  byId: {
    't1': { id: 't1', name: 'Sales', ... },
    't2': { id: 't2', name: 'Customers', ... }
  }
}
```

## Table Properties

| Property           | Type         | Description                                          |
| ------------------ | ------------ | ---------------------------------------------------- |
| `id`               | string       | Unique identifier with 't' prefix (e.g., `t1`, `t2`) |
| `parentId`         | string\|null | ID of parent operation if table belongs to one       |
| `source`           | string\|null | Origin of the table data                             |
| `databaseName`     | string       | Unique name in DuckDB (differs from display name)    |
| `name`             | string       | User-facing display name (mutable)                   |
| `fileName`         | string       | Original uploaded filename                           |
| `extension`        | string       | File extension (e.g., 'csv', 'json')                 |
| `size`             | number       | File size in bytes                                   |
| `mimeType`         | string       | MIME type of the file                                |
| `dateLastModified` | Date\|string | Last modified timestamp                              |
| `columnIds`        | string[]     | Array of column IDs belonging to this table          |
| `rowCount`         | number\|null | Number of rows (fetched from DuckDB)                 |
| `hiddenColumnIds`  | string[]     | Column IDs that are hidden from view                 |

## Reducers

| Reducer        | Description                          |
| -------------- | ------------------------------------ |
| `addTables`    | Adds one or more new tables to state |
| `updateTables` | Updates existing table properties    |
| `deleteTables` | Removes tables by ID                 |

## Selectors

| Selector               | Description                                |
| ---------------------- | ------------------------------------------ |
| `selectAllTableIds`    | Returns all table IDs                      |
| `selectTablesById`     | Returns table(s) by ID (single or array)   |
| `selectTableColumnIds` | Returns column IDs for a table             |
| `selectAllTablesData`  | Returns all tables as an array             |
| `selectTableQueryData` | Returns query data for database operations |

## Database Synchronization

Tables have a `databaseName` property that maps to the actual table name in DuckDB, separate from the user-facing `name` property. This allows users to rename tables without affecting database references.

The `DATABASE_ATTRIBUTES` constant defines which properties are fetched from DuckDB:

- `rowCount`
- `columnIds`

When these properties need refreshing, they can be set to `null` in an update to trigger a database fetch via the `updateTablesSaga`.

## Input Normalization

Like other slices in Roundup, table reducers and selectors accept both single values and arrays. Passing a single ID returns a single object; passing an array of IDs returns an array of objects.
