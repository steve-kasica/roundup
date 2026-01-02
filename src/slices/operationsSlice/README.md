# Operations Slice

This module manages operation metadata in the global data state. Operations represent transformations that combine tables, forming a tree structure where tables are leaves and operations are internal nodes.

## Purpose

The operations slice tracks:

- Operation metadata (type, join configuration, sync state)
- Parent-child relationships forming the operation tree
- Root operation for tree traversal
- Database view synchronization state

## Operation Tree Structure

Operations form a tree where:

- **Tables** are leaf nodes (no children)
- **Operations** are internal nodes (have children)
- The **root operation** is the topmost node
- Each child can only have one parent

```
         [PACK op_1]          ← Root operation
           /      \
    [STACK op_2]  [t3]        ← Mixed children
       /    \
     [t1]   [t2]              ← Table leaves
```

## State Structure

```javascript
{
  allIds: ['o1', 'o2', ...],
  byId: {
    'o1': {
      id: 'o1',
      operationType: 'pack',
      childIds: ['o2', 't3'],
      columnIds: ['c10', 'c11', ...],
      isMaterialized: true,
      isInSync: true,
      joinType: 'FULL OUTER',
      joinKey1: 'c1',
      joinKey2: 'c5',
      ...
    }
  },
  rootOperationId: 'o1'
}
```

## Operation Types

| Constant               | Value     | Description                          |
| ---------------------- | --------- | ------------------------------------ |
| `OPERATION_TYPE_PACK`  | `'pack'`  | Joins tables horizontally (SQL JOIN) |
| `OPERATION_TYPE_STACK` | `'stack'` | Stacks tables vertically (SQL UNION) |
| `OPERATION_TYPE_NO_OP` | `'no-op'` | Placeholder with no database view    |

## Operation Properties

### Common Properties

| Property         | Type           | Description                         |
| ---------------- | -------------- | ----------------------------------- |
| `id`             | string         | Unique identifier with 'o' prefix   |
| `name`           | string \| null | User-facing display name            |
| `databaseName`   | string         | View name in DuckDB                 |
| `operationType`  | string         | `'pack'`, `'stack'`, or `'no-op'`   |
| `parentId`       | string \| null | ID of parent operation              |
| `childIds`       | string[]       | IDs of child tables/operations      |
| `columnIds`      | string[]       | IDs of columns in this operation    |
| `rowCount`       | number \| null | Number of rows in materialized view |
| `isMaterialized` | boolean        | Whether database view exists        |
| `isInSync`       | boolean        | Whether view matches current config |

### PACK-Specific Properties

| Property        | Type           | Description                             |
| --------------- | -------------- | --------------------------------------- |
| `joinType`      | string         | Join type (INNER, LEFT OUTER, etc.)     |
| `joinPredicate` | string         | Join predicate (EQUALS, CONTAINS, etc.) |
| `joinKey1`      | string \| null | Left table join key column ID           |
| `joinKey2`      | string \| null | Right table join key column ID          |
| `matchStats`    | Map            | Match statistics by type                |

## Synchronization Flags

- **`isMaterialized`**: Indicates if a corresponding view exists in DuckDB.
- **`isInSync`**: Indicates if the view matches current operation configuration.

These flags track state rather than timestamps because:

1. Not all updates affect the schema
2. Time deltas are meaningless in Roundup's context
3. Name changes don't affect synchronization

## Join Types

| Constant      | Value           | Description                |
| ------------- | --------------- | -------------------------- |
| `INNER`       | `'INNER'`       | Only matching rows         |
| `LEFT_OUTER`  | `'LEFT OUTER'`  | All left rows + matches    |
| `RIGHT_OUTER` | `'RIGHT OUTER'` | All right rows + matches   |
| `FULL_OUTER`  | `'FULL OUTER'`  | All rows from both tables  |
| `LEFT_ANTI`   | `'LEFT ANTI'`   | Left rows without matches  |
| `RIGHT_ANTI`  | `'RIGHT ANTI'`  | Right rows without matches |
| `FULL_ANTI`   | `'FULL ANTI'`   | All unmatched rows         |

## Reducers

| Reducer            | Description                                |
| ------------------ | ------------------------------------------ |
| `addOperations`    | Adds operation(s), sets as new root        |
| `updateOperations` | Updates existing operation properties      |
| `deleteOperations` | Removes operations, updates root if needed |

## Selectors

| Selector                     | Description                            |
| ---------------------------- | -------------------------------------- |
| `selectOperationsById`       | Returns operation(s) by ID             |
| `selectAllOperationIds`      | Returns all operation IDs              |
| `selectRootOperationId`      | Returns the root operation ID          |
| `selectOperationIdByChildId` | Finds parent operation for a child     |
| `selectOperationDepthById`   | Calculates depth in operation tree     |
| `selectMaxOperationDepth`    | Returns maximum tree depth             |
| `selectOperationQueryData`   | Generates query data for view creation |

## Files

| File                 | Description                         |
| -------------------- | ----------------------------------- |
| `Operation.js`       | Factory function and type constants |
| `operationsSlice.js` | Redux slice with reducers           |
| `selectors.js`       | Memoized selectors                  |
