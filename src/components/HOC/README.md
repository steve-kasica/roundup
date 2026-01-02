# Higher-Order Components (HOCs)

This directory contains Higher-Order Components that inject Redux state into presentation components. HOCs provide a clean separation between data fetching logic and UI rendering, allowing components to remain focused on display concerns.

## Directory Structure

```
HOC/
├── withAlertData.jsx           # Injects single alert data
├── withAssociatedAlerts.jsx    # Injects alerts for an object
├── withColumnData.jsx          # Injects column metadata
├── withOperationData.jsx       # Injects operation data
├── withPackOperationData.jsx   # Injects PACK-specific data
├── withStackColumnData.jsx     # Injects stack column data
├── withStackOperationData.jsx  # Injects STACK-specific data
├── withTableData.jsx           # Injects table metadata
├── withTableRowsData.jsx       # Injects table row data
├── withTableSchemaData.jsx     # Injects table schema
├── withUIData.jsx              # Injects UI state
├── index.js                    # Public exports
└── README.md                   # This file
```

## HOC Summary Table

| HOC                      | Input Prop    | Injected Props             | Description                |
| ------------------------ | ------------- | -------------------------- | -------------------------- |
| `withAlertData`          | `alertId`     | `alert`                    | Single alert object        |
| `withAssociatedAlerts`   | `objectId`    | `alerts`, `alertIds`       | Alerts for table/operation |
| `withColumnData`         | `columnId`    | `column`                   | Column metadata            |
| `withOperationData`      | `operationId` | `operation`, `children`    | Operation with children    |
| `withPackOperationData`  | `operationId` | `matchStats`, `keyColumns` | PACK join statistics       |
| `withStackColumnData`    | `columnId`    | `sources`, `mappings`      | Stack column sources       |
| `withStackOperationData` | `operationId` | `columnMatrix`, `tables`   | STACK alignment data       |
| `withTableData`          | `tableId`     | `table`, `columns`         | Table with columns         |
| `withTableRowsData`      | `tableId`     | `rows`, `totalCount`       | Table row data             |
| `withTableSchemaData`    | `tableId`     | `schema`, `columnIds`      | Table schema info          |
| `withUIData`             | —             | `focusedId`, `searchText`  | UI state                   |

## Theoretical Foundation

From a category theory perspective, these HOCs form a computational context around components. In general, HOCs function as _thunks_, they don't compute anything until invoked with a component, enabling lazy evaluation / deferred computation:

- Dead code elimination: unused HOCs aren't instantiated
- Memoization opportunities: which can optimize the composition
- Dynamic composition: HOCs can be conditionally applied

Each HOC is _functorial_, it maps components to enhanced components while preserving composition:

```
f: Component → EnhancedComponent
g: EnhancedComponent → DoubleEnhancedComponent
g ∘ f: Component → DoubleEnhancedComponent
```

This allows composition chains to be associative `(g ∘ f) ∘ h = g ∘ (f ∘ h)`.

## Usage Patterns

### Basic HOC Usage

```jsx
import { withTableData } from "../HOC";

// Base component receives injected props
function TableCard({ tableId, table, columns }) {
  return (
    <Card>
      <CardHeader title={table.name} />
      <CardContent>{columns.length} columns</CardContent>
    </Card>
  );
}

// Enhanced component only needs tableId
export const EnhancedTableCard = withTableData(TableCard);

// Usage - table and columns are injected
<EnhancedTableCard tableId="table-123" />;
```

### Composing Multiple HOCs

```jsx
import { withOperationData, withAssociatedAlerts, withUIData } from "../HOC";
import { compose } from "redux";

function OperationBlock({
  operationId,
  operation, // from withOperationData
  alerts, // from withAssociatedAlerts
  focusedId, // from withUIData
}) {
  const isFocused = focusedId === operationId;

  return (
    <Paper elevation={isFocused ? 3 : 1}>
      <Typography>{operation.type}</Typography>
      {alerts.length > 0 && <AlertBadge count={alerts.length} />}
    </Paper>
  );
}

// Compose right-to-left: withUIData(withAssociatedAlerts(withOperationData(...)))
export const EnhancedOperationBlock = compose(
  withUIData,
  withAssociatedAlerts,
  withOperationData
)(OperationBlock);
```

### Conditional HOC Application

```jsx
// Apply HOC conditionally based on props
function maybeWithData(condition, hoc) {
  return condition ? hoc : (Component) => Component;
}

const EnhancedComponent = compose(
  maybeWithData(needsAlerts, withAssociatedAlerts),
  withOperationData
)(BaseComponent);
```

## Implementation Pattern

Each HOC follows a consistent pattern:

```jsx
// withExampleData.jsx
import { useSelector } from "react-redux";
import { selectExampleById } from "../../slices/exampleSlice";

const withExampleData = (WrappedComponent) => {
  function WithExampleData({ exampleId, ...props }) {
    // Select data from Redux
    const example = useSelector((state) => selectExampleById(state, exampleId));

    // Early return for missing data
    if (!example) {
      return null; // or <Skeleton />
    }

    // Inject data as props
    return (
      <WrappedComponent exampleId={exampleId} example={example} {...props} />
    );
  }

  // Preserve display name for debugging
  WithExampleData.displayName = `withExampleData(${
    WrappedComponent.displayName || WrappedComponent.name
  })`;

  return WithExampleData;
};

export default withExampleData;
```

## Architectural Benefits

- **Separation of Concerns**: Each layer handles one responsibility
- **Single Responsibility Principle**: HOCs have focused purposes
- **Open/Closed Principle**: Extend behavior without modifying existing code
- **Interface Segregation**: Components receive only props they need
- **Dependency Inversion**: High-level components depend on abstractions (props), not concrete Redux store structure
- **Non-Serializable Props**: Can pass JavaScript objects like `Map` and `Set` that can't be stored in Redux
- **Simplified Sagas**: Better to have simplified saga actions since some actions listen for each other

This is fundamentally different from classical inheritance because there's no shared mutable state between layers, so it's close to Scala's trait system or Haskell's type classes where behaviors are composed rather than inherited, but implemented using JavaScript's first-class functions.

## Injected Prop Details

### withPackOperationData

```javascript
// Injected props
{
  matchStats: {
    leftCount: 1000,      // Rows in left table
    rightCount: 800,      // Rows in right table
    matchCount: 750,      // Matched rows
    leftOnlyCount: 250,   // Left-only rows
    rightOnlyCount: 50    // Right-only rows
  },
  keyColumns: [
    { leftId: 'col-1', rightId: 'col-2', name: 'customer_id' }
  ]
}
```

### withStackOperationData

```javascript
// Injected props
{
  columnMatrix: [
    { name: 'id', sources: ['table-1', 'table-2'] },
    { name: 'name', sources: ['table-1'] },
    { name: 'title', sources: ['table-2'] }
  ],
  tables: [
    { id: 'table-1', name: 'customers', rowCount: 500 },
    { id: 'table-2', name: 'prospects', rowCount: 300 }
  ]
}
```

## Testing HOCs

```jsx
// Test the wrapped component directly with mock data
import { TableCard } from "./TableCard";

test("TableCard displays table info", () => {
  const mockTable = { id: "test", name: "Test Table" };
  const mockColumns = [{ id: "col1", name: "Column 1" }];

  render(<TableCard tableId="test" table={mockTable} columns={mockColumns} />);

  expect(screen.getByText("Test Table")).toBeInTheDocument();
  expect(screen.getByText("1 columns")).toBeInTheDocument();
});
```

## Related Patterns

- **Custom Hooks**: Alternative approach for data fetching
- **React Context**: For deeply nested component trees
- **Render Props**: For more flexible composition

## Migration Notes

This pattern works well with TypeScript which would provide:

- Type safety through the composition chain
- Inference and autocomplete
- Generic constraints
- Utility types for cleaner function signatures
