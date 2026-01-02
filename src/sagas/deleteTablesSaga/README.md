# Delete Tables Saga

The delete tables saga handles the removal of tables and their columns from DuckDB and Redux state.

## Purpose

This saga:

- Drops tables from DuckDB using `DROP TABLE`
- Removes table metadata from Redux state
- Removes associated column metadata (bypassing column saga)
- Auto-deletes tables that lose all their columns

## Architectural Note

Due to a DuckDB limitation, you cannot delete all columns from a table via `ALTER TABLE DROP COLUMN`. Therefore, when a table needs to be deleted, this saga handles the column cleanup directly rather than delegating to `deleteColumnsSaga`.

## Process

```mermaid
---
title: Delete Tables Saga Process
---
flowchart LR
    A[Start] --> B[Normalize input<br>to array]
    B --> C[Fetch table<br>metadata]
    C --> D{More<br>tables?}
    D -->|yes| E[Drop table<br>from DuckDB]
    E --> F{Drop<br>success?}
    F -->|yes| G[Delete columns<br>from state]
    G --> H[Delete table<br>from state]
    H --> I[Add to<br>successes]
    F -->|no| J[Add to<br>failures]
    I --> D
    J --> D
    D -->|no| K{Any<br>failures?}
    K -->|yes| L(Dispatch<br>failure)
    K -->|no| M{Any<br>successes?}
    L --> M
    M -->|yes| N(Dispatch<br>success)
    M -->|no| End
    N --> End
```

## Auto-Deletion Trigger

The watcher listens for `updateTablesSuccess` actions. If a table's `columnIds` property is updated to an empty array, the table is automatically deleted.

```mermaid
---
title: Auto-Delete Empty Tables
---
flowchart LR
    A[updateTablesSuccess] --> B{columnIds<br>changed?}
    B -->|yes| C{columnIds<br>empty?}
    B -->|no| End
    C -->|yes| D[Dispatch<br>deleteTablesRequest]
    C -->|no| End
    D --> End
```

## Actions

| Action                | Type    | Description                 |
| --------------------- | ------- | --------------------------- |
| `deleteTablesRequest` | Request | Initiates table deletion    |
| `deleteTablesSuccess` | Success | Signals successful deletion |
| `deleteTablesFailure` | Failure | Signals deletion failure    |

## Payload Structure

```javascript
{
  tableIds: ['t_1', 't_2', ...]
}
```

## Files

| File         | Description                                   |
| ------------ | --------------------------------------------- |
| `watcher.js` | Watches for requests and auto-delete triggers |
| `worker.js`  | Executes database and state deletions         |
| `actions.js` | Redux action creators                         |
