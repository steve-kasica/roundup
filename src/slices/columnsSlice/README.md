# Columns Slice

This module manages column metadata in the global data state. Columns represent individual data fields within tables or operations and store metadata about types, statistics, and display properties.

## Purpose

The columns slice tracks:

- Column metadata (name, type, statistics)
- Parent relationships (table or operation)
- Database mappings for query generation

## Polymorphic Association

Columns have a _polymorphic association_ with their parent objects—they can belong to either a table or an operation, but not both. The `parentId` property stores the ID of the owning object.

## State Structure

```javascript
{
  allIds: ['c1', 'c2', 'c3', ...],
  byId: {
    'c1': {
      id: 'c1',
      parentId: 't1',
      name: 'customer_id',
      databaseName: 'customer_id',
      columnType: 'NUMERICAL',
      approxUnique: 1000,
      ...
    }
  }
}
```

## Column Properties

| Property       | Type           | Description                                    |
| -------------- | -------------- | ---------------------------------------------- |
| `id`           | string         | Unique identifier with 'c' prefix              |
| `parentId`     | string         | ID of parent table or operation                |
| `name`         | string         | User-facing display name (mutable)             |
| `databaseName` | string         | Actual column name in DuckDB                   |
| `columnType`   | string \| null | Data type (NUMERICAL, CATEGORICAL, etc.)       |
| `approxUnique` | number \| null | Approximate unique value count                 |
| `min`          | any            | Minimum value (for numerical columns)          |
| `max`          | any            | Maximum value (for numerical columns)          |
| `topValues`    | array          | Most frequent values (for categorical columns) |

## Column Types

| Constant                  | Value           | Description        |
| ------------------------- | --------------- | ------------------ |
| `COLUMN_TYPE_NUMERICAL`   | `'NUMERICAL'`   | Numeric data       |
| `COLUMN_TYPE_CATEGORICAL` | `'CATEGORICAL'` | Category/enum data |
| `COLUMN_TYPE_DATE`        | `'DATE'`        | Date/time data     |
| `COLUMN_TYPE_VARCHAR`     | `'VARCHAR'`     | Text/string data   |
| `COLUMN_TYPE_BOOLEAN`     | `'BOOLEAN'`     | Boolean data       |

## Reducers

| Reducer         | Description                          |
| --------------- | ------------------------------------ |
| `addColumns`    | Adds column(s), throws on duplicates |
| `updateColumns` | Updates existing column properties   |
| `deleteColumns` | Removes columns by ID                |

## Selectors

| Selector                            | Description                                      |
| ----------------------------------- | ------------------------------------------------ |
| `selectColumnsById`                 | Returns column(s) by ID                          |
| `selectColumnIdsByParentId`         | Returns all column IDs for a parent              |
| `selectColumnNamesById`             | Returns database name(s) for column ID(s)        |
| `selectSelectedColumnIdsByParentId` | Returns selected columns for a parent            |
| `selectActiveColumnIdsByParentId`   | Returns active (non-hidden) columns for a parent |

## Input Normalization

Reducers and selectors accept both single values and arrays:

```javascript
// Both are valid:
selectColumnsById(state, "c1"); // Returns single column
selectColumnsById(state, ["c1", "c2"]); // Returns array of columns
```

This eliminates the need for singular/plural versions of functions.

## Files

| File              | Description                         |
| ----------------- | ----------------------------------- |
| `Column.js`       | Factory function and type constants |
| `columnsSlice.js` | Redux slice with reducers           |
| `selectors.js`    | Memoized selectors                  |
