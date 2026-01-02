# Delete Columns Saga

The delete columns saga handles the removal of columns from both DuckDB tables and Redux state. It supports recursive deletion for operation columns by propagating deletions to child tables.

## Purpose

This saga:

- Drops columns from DuckDB tables using `ALTER TABLE`
- Removes column metadata from Redux state
- Handles operation column deletions by recursing into child tables
- Supports both PACK and STACK operation column propagation

## Process

```mermaid
---
title: Delete Columns Saga Process
---
flowchart LR
    A[Start] --> B[Group columns<br>by parent]
    B --> C{More<br>parents?}
    C -->|yes| D{Is parent<br>a table?}
    D -->|yes| E[Queue for<br>DB deletion]
    D -->|no| F[Map to child<br>columns]
    F --> G[Dispatch recursive<br>delete request]
    E --> C
    G --> C
    C -->|no| H[[Worker:<br>Execute deletions]]
    H --> I{DB deletion<br>success?}
    I -->|yes| J[Remove from<br>Redux state]
    I -->|no| K[Add to<br>failures]
    J --> L{More<br>deletions?}
    K --> L
    L -->|yes| H
    L -->|no| M(Dispatch<br>success/failure)
    M --> End
```

## Recursive Deletion

When deleting columns from an operation:

### PACK Operations

- Column at index `i` maps to left table column if `i < leftTableColumnCount`
- Otherwise maps to right table column at `i - leftTableColumnCount`

### STACK Operations

- Column at index `i` maps to column at same index in all child tables

## Actions

| Action                 | Type    | Description                 |
| ---------------------- | ------- | --------------------------- |
| `deleteColumnsRequest` | Request | Initiates column deletion   |
| `deleteColumnsSuccess` | Success | Signals successful deletion |
| `deleteColumnsFailure` | Failure | Signals deletion failure    |

## Payload Structure

```javascript
{
  columnIds: ['col_1', 'col_2', ...]
}
```

## Files

| File         | Description                                          |
| ------------ | ---------------------------------------------------- |
| `watcher.js` | Watches for requests and handles recursive expansion |
| `worker.js`  | Executes database and state deletions                |
| `actions.js` | Redux action creators                                |
