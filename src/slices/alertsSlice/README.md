# Alerts Slice

This module manages validation alerts for operations and tables. Alerts communicate errors and warnings to users about structural issues in their data operations.

## Purpose

The alerts slice tracks validation errors and warnings, such as:

- Missing join keys in PACK operations
- Incongruent table structures in STACK operations
- Missing join predicates or types

## ID Generation

Unlike other slices, alert IDs are deterministic rather than auto-incremented. Each alert ID is composed of:

```
{sourceId}_{alertCode}
```

This ensures that the same error on the same object always produces the same alert ID, enabling:

- Duplicate prevention (same alert won't be added twice)
- Easy lookup of alerts by source object
- Consistent alert identity across sessions

## State Structure

```javascript
{
  allIds: ['op_1_MISSING_JOIN_KEY', ...],
  byId: {
    'op_1_MISSING_JOIN_KEY': {
      id: 'op_1_MISSING_JOIN_KEY',
      code: 'MISSING_JOIN_KEY',
      name: 'Missing Join Key',
      description: '...',
      severity: 'error',
      sourceId: 'op_1',
      isPassing: false,
      isSilenced: false,
      message: null,
      timeStamp: 1704067200000
    }
  }
}
```

## Alert Properties

| Property      | Type           | Description                                |
| ------------- | -------------- | ------------------------------------------ |
| `id`          | string         | Unique ID: `{sourceId}_{code}`             |
| `code`        | string         | Alert type code (e.g., `MISSING_JOIN_KEY`) |
| `name`        | string         | Human-readable alert name                  |
| `description` | string         | Detailed explanation                       |
| `severity`    | string         | `'error'` or `'warning'`                   |
| `sourceId`    | string         | ID of the object that raised the alert     |
| `isPassing`   | boolean        | Whether the condition is now passing       |
| `isSilenced`  | boolean        | Whether the user has silenced this alert   |
| `message`     | string \| null | Custom message for this instance           |
| `timeStamp`   | number         | Creation timestamp                         |

## Severity Levels

| Constant           | Value       | Description                              |
| ------------------ | ----------- | ---------------------------------------- |
| `SEVERITY_ERROR`   | `'error'`   | Fatal errors that prevent operation      |
| `SEVERITY_WARNING` | `'warning'` | Non-fatal issues that may need attention |

## Reducers

| Reducer        | Description                       |
| -------------- | --------------------------------- |
| `addAlerts`    | Adds alert(s), skips duplicates   |
| `updateAlerts` | Updates existing alert properties |
| `deleteAlerts` | Removes alerts by ID              |

## Selectors

| Selector                       | Description                            |
| ------------------------------ | -------------------------------------- |
| `selectAllAlertIds`            | Returns all alert IDs                  |
| `selectAlertsById`             | Returns alert(s) by ID                 |
| `selectAlertIdsBySourceId`     | Returns alert IDs for a source object  |
| `selectAllSourceIdsWithAlerts` | Returns IDs of all objects with alerts |
| `selectAlertWarningCount`      | Counts warnings for a source           |
| `selectAlertErrorCount`        | Counts errors for a source             |
| `selectSilencedWarningCount`   | Counts silenced warnings for a source  |

## Alert Types

### Errors (`Alerts/Errors/`)

| Alert                  | Description                               |
| ---------------------- | ----------------------------------------- |
| `IncongruentTables`    | STACK tables have incompatible structures |
| `MissingJoinPredicate` | PACK operation missing join predicate     |
| `MissingJoinType`      | PACK operation missing join type          |
| `MissingLeftJoinKey`   | PACK operation missing left join key      |
| `MissingRightJoinKey`  | PACK operation missing right join key     |

### Warnings (`Alerts/Warnings/`)

| Alert                      | Description                   |
| -------------------------- | ----------------------------- |
| `HeterogeneousColumnTypes` | Columns have mixed data types |

## Files

| File               | Description                  |
| ------------------ | ---------------------------- |
| `alertsSlice.js`   | Redux slice with reducers    |
| `selectors.js`     | Memoized selectors           |
| `Alerts/Alert.js`  | Base Alert factory function  |
| `Alerts/Errors/`   | Error alert type factories   |
| `Alerts/Warnings/` | Warning alert type factories |
