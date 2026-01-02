# Alerts Saga

The alerts saga manages the lifecycle of validation alerts for operations. It automatically validates operations when changes occur and manages alert state in Redux.

## Purpose

This saga detects and reports structural issues with operations, such as:

- Column misalignment in STACK operations
- Join configuration problems in PACK operations
- Missing or incompatible child relationships

## Process

```mermaid
---
title: Alerts Saga Process
---
flowchart LR
    A[Start] --> B{Trigger<br>type?}
    B -->|Explicit request| C[Get operation IDs<br>from payload]
    B -->|Auto-trigger| D[Extract affected<br>operations]
    C --> E[Run validation tests]
    D --> E
    E --> F{Operation<br>type?}
    F -->|STACK| G[Test for<br>stack errors]
    F -->|PACK| H[Test for<br>pack errors]
    G --> I[Collect<br>raised alerts]
    H --> I
    I --> J[[Worker:<br>Process alerts]]
    J --> K{Compare with<br>existing alerts}
    K --> L[Add new alerts]
    K --> M[Remove resolved<br>alerts]
    L --> End
    M --> End
```

## Triggers

The watcher responds to multiple action types:

| Action                           | Description                                      |
| -------------------------------- | ------------------------------------------------ |
| `checkOperationForAlertsRequest` | Explicit request to validate specific operations |
| `updateOperationsSuccess`        | Auto-validates after operation updates           |
| `updateTablesSuccess`            | Auto-validates after table column changes        |
| `createOperationsSuccess`        | Auto-validates newly created operations          |

## Actions

| Action                           | Type    | Description                           |
| -------------------------------- | ------- | ------------------------------------- |
| `updateAlertsRequest`            | Request | Triggers full alert recalculation     |
| `checkOperationForAlertsRequest` | Request | Checks specific operations for alerts |

## Files

| File         | Description                                     |
| ------------ | ----------------------------------------------- |
| `watcher.js` | Watches for actions and coordinates validation  |
| `worker.js`  | Processes raised alerts and updates Redux state |
| `actions.js` | Redux action creators                           |
