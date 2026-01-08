# Operation View

This directory contains the routing component that renders the appropriate view based on operation type. It serves as the main entry point for displaying any operation in the schema.

## Directory Structure

```
OperationView/
├── OperationHeader.jsx         # Operation header with controls
├── OperationViewContainer.jsx  # Container with layout
├── index.js                    # Public exports
└── README.md                   # This file
```

## Components

### OperationBlock

The primary routing component that renders the correct view based on operation type.

| Prop          | Type      | Required | Description              |
| ------------- | --------- | -------- | ------------------------ |
| `operationId` | `string`  | Yes      | Operation identifier     |
| `operation`   | `object`  | No       | Operation data (via HOC) |
| `compact`     | `boolean` | No       | Use compact layout       |
| `showHeader`  | `boolean` | No       | Display operation header |

### Routing Logic

```javascript
switch (operation.type) {
  case OPERATION_TYPE_NO_OP:
    return <TableView tableId={operation.tableId} />;

  case OPERATION_TYPE_PACK:
    return <PackSchemaView operationId={operationId} />;

  case OPERATION_TYPE_STACK:
    return <StackSchemaView operationId={operationId} />;

  default:
    return <UnknownOperationType />;
}
```

## Operation Types

| Type         | Constant               | View Component    | Description                     |
| ------------ | ---------------------- | ----------------- | ------------------------------- |
| No Operation | `OPERATION_TYPE_NO_OP` | `TableView`       | Single table, no transformation |
| Pack         | `OPERATION_TYPE_PACK`  | `PackSchemaView`  | Join operation                  |
| Stack        | `OPERATION_TYPE_STACK` | `StackSchemaView` | Union operation                 |

## Visual Routing

```
                    OperationBlock
                          │
                          ▼
              ┌───────────────────────┐
              │  What type is this    │
              │     operation?        │
              └───────────────────────┘
                    │    │    │
         ┌──────────┘    │    └──────────┐
         ▼               ▼               ▼
    ┌─────────┐    ┌─────────┐    ┌─────────┐
    │  NO_OP  │    │  PACK   │    │  STACK  │
    └─────────┘    └─────────┘    └─────────┘
         │               │               │
         ▼               ▼               ▼
    TableView     PackSchemaView  StackSchemaView
```

## Usage Examples

### Basic Operation Display

```jsx
import { EnhancedOperationBlock } from "../components/OperationView";

function SchemaPanel({ operationId }) {
  return (
    <div className="schema-panel">
      <EnhancedOperationBlock operationId={operationId} showHeader />
    </div>
  );
}
```

## OperationHeader

Header component with operation controls and metadata.

| Prop          | Type     | Required | Description              |
| ------------- | -------- | -------- | ------------------------ |
| `operationId` | `string` | Yes      | Operation identifier     |
| `operation`   | `object` | No       | Operation data (via HOC) |

### Header Layout

```
┌──────────────────────────────────────────────────────────┐
│ ⚙ PACK Operation           [Alerts: 2] [⋯] [Focus] [🗑]  │
│ ↑  ↑                           ↑         ↑    ↑      ↑   │
│ Icon Type                    Badge    Menu Focus Delete  │
└──────────────────────────────────────────────────────────┘
```

### Header Actions

| Action | Icon  | Description                    |
| ------ | ----- | ------------------------------ |
| Alerts | Badge | Shows error/warning count      |
| Menu   | ⋯     | Context menu with more options |
| Focus  | 🎯    | Focus on this operation        |
| Delete | 🗑     | Remove operation               |

## HOC Integration

The component uses `withOperationData` for automatic data injection:

```jsx
import { withOperationData } from "../HOC";

// Base component
function OperationBlock({ operationId, operation, children }) {
  // operation is injected by HOC
}

// Enhanced version with automatic data
export const EnhancedOperationBlock = withOperationData(OperationBlock);
```

## Nested Operations

Operations can contain other operations recursively:

```jsx
// A PACK operation containing a STACK operation
{
  id: 'pack-1',
  type: 'PACK',
  children: [
    'table-1',      // Direct table reference
    'stack-1'       // Nested operation
  ]
}

// OperationBlock handles both cases
function renderChild(childId) {
  if (isOperationId(childId)) {
    return <EnhancedOperationBlock operationId={childId} />;
  } else {
    return <EnhancedTableView tableId={childId} />;
  }
}
```

## Redux Integration

```javascript
// Key selectors
selectOperationById(state, operationId);
selectOperationType(state, operationId);
selectOperationChildren(state, operationId);
isOperationId(id); // Check if ID is an operation

// Key actions
removeOperation(operationId);
focusObject(operationId);
```

## Related Components

- **PackSchemaView** (`PackOperationView/`) - PACK operation display
- **StackSchemaView** (`StackOperationView/`) - STACK operation display
- **TableView** (`TableView/`) - NO_OP table display
- **OperationsList** - Alternative list view
- **CompositeTableSchema** - Full schema tree

## Performance Notes

1. **Lazy Loading**: Operation views load data on mount
2. **Memoization**: Component memoized to prevent unnecessary re-renders
3. **Selective Updates**: Only re-renders when operation changes
