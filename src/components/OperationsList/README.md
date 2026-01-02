# Operations List

This directory contains components for displaying all operations in an accordion-style list view. This provides an alternative to the tree visualization in `CompositeTableSchema`, offering a more traditional list-based navigation.

## Directory Structure

```
OperationsList/
├── OperationAccordion.jsx      # Accordion wrapper for operations
├── OperationsList.jsx          # Main list container
├── OperationsListHeader.jsx    # List header with actions
├── index.js                    # Public exports
└── README.md                   # This file
```

## Components

### OperationsList

The main container component rendering all operations as expandable accordions.

| Prop           | Type       | Required | Description                          |
| -------------- | ---------- | -------- | ------------------------------------ |
| `operationIds` | `string[]` | No       | Operations to show (defaults to all) |
| `expandedId`   | `string`   | No       | Currently expanded operation         |
| `onExpand`     | `function` | No       | Expansion change handler             |

### Key Features

1. **Accordion Interface**: One operation expanded at a time
2. **Automatic Expansion**: Expands when operation is focused
3. **Nested Display**: Shows operation hierarchy
4. **Quick Actions**: Common actions in header

### OperationAccordion

Individual accordion item for a single operation.

| Prop          | Type       | Required | Description              |
| ------------- | ---------- | -------- | ------------------------ |
| `operationId` | `string`   | Yes      | Operation identifier     |
| `expanded`    | `boolean`  | Yes      | Expansion state          |
| `onToggle`    | `function` | Yes      | Toggle handler           |
| `operation`   | `object`   | No       | Operation data (via HOC) |

## Visual Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Operations                                    [+ Stack]    │
├─────────────────────────────────────────────────────────────┤
│  ▸ PACK: customers + orders                        [2 ⚠]   │
├─────────────────────────────────────────────────────────────┤
│  ▾ STACK: all_sales                                         │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                                                         ││
│  │     [StackSchemaView content here]                      ││
│  │                                                         ││
│  └─────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│  ▸ customers (NO_OP)                                        │
├─────────────────────────────────────────────────────────────┤
│  ▸ orders (NO_OP)                                           │
└─────────────────────────────────────────────────────────────┘
```

## Accordion Header Content

Each accordion header displays:

| Element        | Description                          |
| -------------- | ------------------------------------ |
| Expand Icon    | ▸/▾ indicates collapsed/expanded     |
| Operation Type | PACK, STACK, or table name for NO_OP |
| Operation Name | User-assigned name or auto-generated |
| Alert Badge    | Warning/error count if any           |
| Quick Actions  | Delete, focus, menu                  |

```
┌────────────────────────────────────────────────────────────┐
│ ▾  ⚙ PACK: customer_orders           [3 ⚠]  [🎯] [⋯] [🗑] │
│ ↑  ↑  ↑     ↑                          ↑      ↑    ↑   ↑   │
│ Exp Icon Type Name                   Alerts Focus Menu Del │
└────────────────────────────────────────────────────────────┘
```

## Usage Examples

### Basic Operations List

```jsx
import { OperationsList } from "../components/OperationsList";

function OperationsPanel() {
  return (
    <div className="operations-panel">
      <OperationsList />
    </div>
  );
}
```

### Controlled Expansion

```jsx
function ControlledOperationsList({ focusedId }) {
  const [expandedId, setExpandedId] = useState(null);

  // Auto-expand when focus changes
  useEffect(() => {
    if (focusedId && isOperationId(focusedId)) {
      setExpandedId(focusedId);
    }
  }, [focusedId]);

  return <OperationsList expandedId={expandedId} onExpand={setExpandedId} />;
}
```

### Filtered Operations

```jsx
function PackOperationsOnly() {
  const packOperationIds = useSelector(selectPackOperationIds);

  return <OperationsList operationIds={packOperationIds} />;
}
```

## OperationsListHeader

Header component with list-level actions.

| Prop             | Type       | Required | Description                 |
| ---------------- | ---------- | -------- | --------------------------- |
| `onAddStack`     | `function` | No       | Add STACK operation handler |
| `onAddPack`      | `function` | No       | Add PACK operation handler  |
| `operationCount` | `number`   | No       | Total operation count       |

### Header Layout

```
┌────────────────────────────────────────────────────────────┐
│  Operations (3)                    [+ Stack] [+ Pack]      │
└────────────────────────────────────────────────────────────┘
```

## Hierarchy Display

Operations are displayed in a flattened hierarchy with indentation:

```jsx
// Operation tree
{
  root: {
    type: 'PACK',
    children: ['stack-1', 'table-3']
  },
  'stack-1': {
    type: 'STACK',
    children: ['table-1', 'table-2']
  }
}

// Rendered as:
// ▸ PACK: root
//   ├─ ▸ STACK: stack-1
//   │    ├─ table-1
//   │    └─ table-2
//   └─ table-3
```

## Redux Integration

```javascript
// Key selectors
selectAllOperationIds(state); // All operation IDs
selectRootOperation(state); // Root operation
selectOperationChildren(state, id); // Children of operation

// Key actions
focusObject(operationId); // Focus an operation
removeOperation(operationId); // Delete operation
```

## Keyboard Navigation

| Key      | Action                               |
| -------- | ------------------------------------ |
| `Enter`  | Toggle expansion                     |
| `Delete` | Remove operation (with confirmation) |
| `↑/↓`    | Navigate between operations          |
| `←/→`    | Collapse/expand                      |

## Related Components

- **CompositeTableSchema** - Visual tree view (alternative)
- **OperationBlock** (`OperationView/`) - Operation renderer
- **PackSchemaView** (`PackOperationView/`) - PACK content
- **StackSchemaView** (`StackOperationView/`) - STACK content

## Performance Considerations

1. **Lazy Rendering**: Collapsed operations don't render content
2. **Single Expansion**: Only one operation expanded at a time
3. **Virtualization**: Consider for very long operation lists
4. **Memoized Headers**: Headers memoized to prevent re-renders
