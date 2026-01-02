# Delete Operations Saga

The delete operations saga handles the removal of operations and their corresponding database views from DuckDB and Redux state.

## Purpose

This saga:

- Drops database views for PACK and STACK operations
- Removes operation metadata from Redux state
- Handles NO_OP operations (state-only deletion)
- Auto-deletes operations that become childless

## Process

```mermaid
---
title: Delete Operations Saga Process
---
flowchart LR
    A[Start] --> B[Normalize input<br>to array]
    B --> C{More<br>operations?}
    C -->|yes| D{Is<br>NO_OP?}
    D -->|no| E[Drop view<br>from DuckDB]
    D -->|yes| F[Skip DB<br>deletion]
    E --> G{Drop<br>success?}
    G -->|yes| H[Remove from<br>Redux state]
    G -->|no| I[Add to<br>failures]
    F --> H
    H --> J[Add to<br>successes]
    I --> C
    J --> C
    C -->|no| K{Any<br>successes?}
    K -->|yes| L(Dispatch<br>success)
    K -->|no| M{Any<br>failures?}
    L --> M
    M -->|yes| N(Dispatch<br>failure)
    M -->|no| End
    N --> End
```

## Auto-Deletion Trigger

The watcher listens for `updateOperationsSuccess` actions. If an operation's `childIds` property is updated to an empty array, the operation is automatically deleted.

```mermaid
---
title: Auto-Delete Childless Operations
---
flowchart LR
    A[updateOperationsSuccess] --> B{childIds<br>changed?}
    B -->|yes| C{childIds<br>empty?}
    B -->|no| End
    C -->|yes| D[Dispatch<br>deleteOperationsRequest]
    C -->|no| End
    D --> End
```

## Actions

| Action                    | Type    | Description                  |
| ------------------------- | ------- | ---------------------------- |
| `deleteOperationsRequest` | Request | Initiates operation deletion |
| `deleteOperationsSuccess` | Success | Signals successful deletion  |
| `deleteOperationsFailure` | Failure | Signals deletion failure     |

## Payload Structure

```javascript
{
  operationIds: ['o_1', 'o_2', ...]
}
```

## Files

| File         | Description                                   |
| ------------ | --------------------------------------------- |
| `watcher.js` | Watches for requests and auto-delete triggers |
| `worker.js`  | Executes database and state deletions         |
| `actions.js` | Redux action creators                         |
