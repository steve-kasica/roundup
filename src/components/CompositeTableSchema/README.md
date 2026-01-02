# Composite Table Schema

This directory contains the main schema visualization component that displays the complete operation tree as an interactive, hierarchical diagram. It shows how tables are combined through STACK (union) and PACK (join) operations.

## Directory Structure

```
CompositeTableSchema/
├── CompositeTableSchema.jsx  # Main schema visualization (157 lines)
├── OperationTreeViz.jsx      # Recursive tree renderer
├── TableDropTarget.jsx       # Drop zone for adding tables
├── index.js                  # Public exports
└── README.md                 # This file
```

## Visual Representation

The component renders a nested treemap layout showing the operation hierarchy:

```
┌─────────────────────────────────────────────────────────────┐
│                     ROOT OPERATION                          │
│  ┌─────────────────────────────────────────────────────────┤
│  │                    STACK                                 │
│  │  ┌──────────────────┐ ┌──────────────────┐              │
│  │  │    Table A       │ │    Table B       │              │
│  │  │                  │ │                  │              │
│  │  └──────────────────┘ └──────────────────┘              │
│  └─────────────────────────────────────────────────────────┤
│                           ↕                                 │
│  ┌─────────────────────────────────────────────────────────┤
│  │                    PACK                                  │
│  │  ┌──────────────────┐ ┌──────────────────┐              │
│  │  │    Table C       │ │    Table D       │              │
│  │  └──────────────────┘ └──────────────────┘              │
│  └─────────────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────────────┘
```

## Components

### CompositeTableSchema

The main container component that renders the complete schema tree.

| Prop              | Type      | Required | Description                   |
| ----------------- | --------- | -------- | ----------------------------- |
| `rootOperationId` | `string`  | No       | Start from specific operation |
| `readOnly`        | `boolean` | No       | Disable editing capabilities  |

### Key Features

1. **Visual Hierarchy**: Nested blocks show operation structure
2. **Drop Targets**: Add tables via drag-and-drop
3. **Error Awareness**: Disabled when schema has errors
4. **Focus Navigation**: Click to focus on operations/tables
5. **Material Sync**: Visual indicator for DuckDB sync state

### TableDropTarget

Drop zones for adding tables to operations.

| Prop          | Type      | Required | Description                     |
| ------------- | --------- | -------- | ------------------------------- |
| `operationId` | `string`  | Yes      | Target operation for drops      |
| `position`    | `string`  | Yes      | 'stack' or 'pack' drop position |
| `disabled`    | `boolean` | No       | Disable drops (during errors)   |

## Operation Types

### NO_OP (Single Table)

```
┌─────────────────────┐
│   NO OPERATION      │
│ ┌─────────────────┐ │
│ │    Table A      │ │
│ └─────────────────┘ │
└─────────────────────┘
```

- Initial state with one table
- Shows table directly with drop zones to add more

### STACK (Union)

```
┌─────────────────────────────────────┐
│           STACK OPERATION           │
│ ┌───────────────┐ ┌───────────────┐ │
│ │   Table A     │ │   Table B     │ │
│ └───────────────┘ └───────────────┘ │
│      [+ Add table to stack]         │
└─────────────────────────────────────┘
```

- Tables stacked vertically (like SQL UNION)
- Columns aligned by name
- Drop zone at bottom for more tables

### PACK (Join)

```
┌─────────────────────────────────────┐
│           PACK OPERATION            │
│ ┌───────────────┐ ┌───────────────┐ │
│ │   Table A     │↔│   Table B     │ │
│ └───────────────┘ └───────────────┘ │
│      [+ Pack another table]         │
└─────────────────────────────────────┘
```

- Tables joined horizontally (like SQL JOIN)
- Key columns matched for joining
- Drop zone for additional tables

## Usage Examples

### Basic Schema Display

```jsx
import { CompositeTableSchema } from "../components/CompositeTableSchema";

function SchemaEditor() {
  return (
    <div className="schema-container">
      <CompositeTableSchema />
    </div>
  );
}
```

### Read-Only Preview

```jsx
function SchemaPreview({ operationId }) {
  return <CompositeTableSchema rootOperationId={operationId} readOnly />;
}
```

### With Error Handling

```jsx
function SchemaWithErrors() {
  const errorCount = useSelector(selectAlertErrorCount);

  return (
    <div>
      {errorCount > 0 && (
        <Alert severity="error">Fix {errorCount} errors before editing</Alert>
      )}
      <CompositeTableSchema />
    </div>
  );
}
```

## Layout Algorithm

The treemap layout uses a simple recursive algorithm:

1. **Root Level**: Full available width
2. **STACK Children**: Divide height equally among children
3. **PACK Children**: Divide width equally among children
4. **Nested Operations**: Recursively apply same rules

```javascript
// Simplified layout logic
function calculateLayout(operation, bounds) {
  const children = getChildren(operation);

  if (operation.type === "STACK") {
    // Divide vertically
    const height = bounds.height / children.length;
    children.forEach((child, i) => {
      child.bounds = { ...bounds, y: i * height, height };
    });
  } else if (operation.type === "PACK") {
    // Divide horizontally
    const width = bounds.width / children.length;
    children.forEach((child, i) => {
      child.bounds = { ...bounds, x: i * width, width };
    });
  }
}
```

## Drag and Drop

### Accepted Drop Types

| Source                | Action               |
| --------------------- | -------------------- |
| Table from TablesList | Add to operation     |
| Column from TableView | Move column (future) |
| Operation block       | Reorder (future)     |

### Drop Target Positioning

```jsx
// STACK operation has bottom drop zone
<StackDropTarget operationId={op.id} position="bottom" />

// PACK operation has right drop zone
<PackDropTarget operationId={op.id} position="right" />
```

## Redux Integration

```javascript
// Key selectors
selectRootOperation(state); // Get root operation
selectOperationChildren(state, id); // Get child operations/tables
selectFocusedObjectId(state); // Currently focused item

// Related actions
focusObject(objectId); // Focus an operation/table
```

## Related Components

- **OperationBlock** (`OperationView/`) - Renders individual operations
- **TableDropTarget** (local) - Drop zone component
- **EnhancedOperationBlock** - HOC-wrapped operation display
- **OperationsList** - Alternative list view of operations

## Error States

When schema has errors:

1. Drop targets are disabled
2. Visual indicator shows error state
3. Editing blocked until errors resolved
4. Error count displayed in header
