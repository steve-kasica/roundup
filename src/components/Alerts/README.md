# Alerts Components

This directory contains components for displaying schema validation alerts and error messages. Alerts are generated during data operations (PACK/STACK) when issues like missing columns, type mismatches, or key conflicts are detected.

## Directory Structure

```
Alerts/
├── AlertDescription.jsx    # Main alert display component with HOC
├── index.js               # Public exports
└── README.md             # This file
```

## Components

### AlertDescription

The primary component for rendering alert details with severity-appropriate styling and icons.

| Prop          | Type      | Required | Description                     |
| ------------- | --------- | -------- | ------------------------------- |
| `alertId`     | `string`  | Yes      | Unique identifier for the alert |
| `alert`       | `object`  | No       | Alert data (injected by HOC)    |
| `dense`       | `boolean` | No       | Use compact layout              |
| `showSilence` | `boolean` | No       | Show silence button             |

**Alert Object Structure:**

```javascript
{
  id: 'alert-123',
  severity: 'error',           // 'error' | 'warning' | 'info'
  message: 'Column not found',
  operationId: 'op-456',       // Related operation
  columnId: 'col-789',         // Related column (optional)
  tableId: 'table-abc',        // Related table (optional)
  silenced: false              // Whether alert is silenced
}
```

## HOC Integration

The component uses `withAlertData` HOC to automatically inject alert data from Redux:

```jsx
import { EnhancedAlertDescription } from "../Alerts";

// Just pass the alertId - data is injected automatically
<EnhancedAlertDescription alertId={alertId} />;
```

**Without HOC (manual data passing):**

```jsx
import { AlertDescription } from "../Alerts";

const alert = useSelector((state) => selectAlertById(state, alertId));
<AlertDescription alertId={alertId} alert={alert} />;
```

## Severity Icons

Each alert severity displays with a distinctive icon:

| Severity  | Icon        | Color | Description                         |
| --------- | ----------- | ----- | ----------------------------------- |
| `error`   | ErrorIcon   | Red   | Critical issues requiring attention |
| `warning` | WarningIcon | Amber | Potential problems                  |
| `info`    | InfoIcon    | Blue  | Informational notices               |

## Usage Examples

### Basic Alert Display

```jsx
import { EnhancedAlertDescription } from "../components/Alerts";

function SchemaAlerts({ alertIds }) {
  return (
    <div>
      {alertIds.map((id) => (
        <EnhancedAlertDescription key={id} alertId={id} showSilence />
      ))}
    </div>
  );
}
```

### Dense Alert List

```jsx
function CompactAlertList({ alertIds }) {
  return (
    <List dense>
      {alertIds.map((id) => (
        <ListItem key={id}>
          <EnhancedAlertDescription alertId={id} dense />
        </ListItem>
      ))}
    </List>
  );
}
```

### Alert Badge Button

```jsx
import { SchemaAlertsButton } from "../ui/buttons";

// Shows badge count and opens alert list
<SchemaAlertsButton operationId={operationId} />;
```

## Related Components

- **SchemaAlertsButton** (`ui/buttons/`) - Button with error count badge
- **SilenceAlertButton** (`ui/buttons/`) - Toggle alert silencing
- **AlertErrorIcon** (`ui/icons/`) - Error severity icon
- **AlertWarningIcon** (`ui/icons/`) - Warning severity icon

## Redux Integration

Alerts are managed by `alertsSlice`:

```javascript
// Selectors
selectAlertById(state, alertId); // Get single alert
selectAlertsByObject(state, objectId); // Get alerts for operation/column
selectAlertErrorCount(state); // Total error count
selectAlertWarningCount(state); // Total warning count

// Actions (via sagas)
// Alerts are generated automatically by buildOperationTreeSaga
// and cleared when operations are removed
```

## Architecture Notes

1. **Automatic Alert Generation**: Alerts are created by sagas during PACK/STACK operations
2. **Object Association**: Each alert links to specific operations, columns, or tables
3. **Silencing**: Users can silence alerts without resolving underlying issues
4. **Error Blocking**: Operations with errors disable schema editing until resolved
