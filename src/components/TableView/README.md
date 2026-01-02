# Table View

This directory contains components for displaying individual source tables, including schema information, column lists, and row data. These components are used for NO_OP operations (single tables) and as building blocks within PACK and STACK views.

## Directory Structure

```
TableView/
├── BarChartCell.js           # Value distribution cell
├── StyledTableRow.js         # Styled row component
├── TableBlock.jsx            # Draggable table block
├── TableDragContainer.jsx    # Drag source container
├── TableDragPreview.jsx      # Custom drag preview
├── TableHeader.jsx           # Table header with actions
├── TableLabel.jsx            # Table name label
├── TableName.jsx             # Editable table name
├── TableRowMatches.jsx       # Match indicator for PACK
├── TableRowSummary.jsx       # Row count summary
├── TableRows.jsx             # Data rows display (163 lines)
├── TableSchema.jsx           # Schema with columns (488 lines)
├── TableSchemaToolbar.jsx    # Schema toolbar actions
├── index.js                  # Public exports
└── README.md                 # This file
```

## Components Overview

| Component          | Purpose              | Key Features                      |
| ------------------ | -------------------- | --------------------------------- |
| `TableSchema`      | Full table display   | Column list, statistics, actions  |
| `TableRows`        | Row data display     | Virtualized, sortable, filterable |
| `TableHeader`      | Header with metadata | Row count, actions, alerts        |
| `TableBlock`       | Draggable table      | Drag source for operations        |
| `TableDragPreview` | Drag preview         | Custom preview during drag        |

## TableSchema

The primary component for displaying a complete table schema with columns.

### Props

| Prop       | Type       | Required | Description              |
| ---------- | ---------- | -------- | ------------------------ |
| `tableId`  | `string`   | Yes      | Table identifier         |
| `table`    | `object`   | No       | Table data (via HOC)     |
| `columns`  | `object[]` | No       | Column list (via HOC)    |
| `compact`  | `boolean`  | No       | Use compact layout       |
| `showRows` | `boolean`  | No       | Display row data section |

### Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│                      TABLE SCHEMA                           │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  📊 customers.csv                    1,000 rows   [⋯]  ││
│  │     ↑                                  ↑            ↑   ││
│  │   Icon Name                        Row Count     Menu   ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Search columns...                    [Show Hidden: 2] ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  ┌──────────────┬──────────┬────────────────────────────────│
│  │ Column       │ Type     │ Stats                          │
│  ├──────────────┼──────────┼────────────────────────────────│
│  │ # id         │ integer  │ 1-1000, no nulls               │
│  │ Abc name     │ string   │ 998 unique                     │
│  │ Abc email    │ string   │ 995 unique, 5 nulls            │
│  │ # age        │ integer  │ 18-95, mean: 42                │
│  └──────────────┴──────────┴────────────────────────────────│
│                                                             │
│  [Show Rows ▾]                                              │
└─────────────────────────────────────────────────────────────┘
```

## TableRows

Virtualized component for displaying table row data.

### Props

| Prop            | Type              | Required | Description                  |
| --------------- | ----------------- | -------- | ---------------------------- |
| `tableId`       | `string`          | Yes      | Table identifier             |
| `columns`       | `string[]`        | No       | Visible column IDs           |
| `pageSize`      | `number`          | No       | Rows per page (default: 100) |
| `sortColumn`    | `string`          | No       | Sort by column               |
| `sortDirection` | `'asc' \| 'desc'` | No       | Sort direction               |
| `filter`        | `object`          | No       | Filter configuration         |

### Virtualization

```javascript
// Uses react-window for virtualization
<FixedSizeList height={400} itemCount={totalRows} itemSize={35} width="100%">
  {({ index, style }) => (
    <TableRow style={style} row={rows[index]} columns={visibleColumns} />
  )}
</FixedSizeList>
```

### Row Display

```
┌─────────────────────────────────────────────────────────────┐
│  id    │ name       │ email              │ age              │
├─────────────────────────────────────────────────────────────┤
│  1     │ Alice      │ alice@example.com  │ 32               │
│  2     │ Bob        │ bob@example.com    │ 45               │
│  3     │ Carol      │ carol@example.com  │ 28               │
│  ...   │ ...        │ ...                │ ...              │
│  1000  │ Zoe        │ zoe@example.com    │ 51               │
├─────────────────────────────────────────────────────────────┤
│  Showing 1-100 of 1,000 rows                    [Load More] │
└─────────────────────────────────────────────────────────────┘
```

## TableBlock

Draggable table representation for adding to operations.

### Props

| Prop        | Type       | Required | Description                 |
| ----------- | ---------- | -------- | --------------------------- |
| `tableId`   | `string`   | Yes      | Table identifier            |
| `table`     | `object`   | No       | Table data (via HOC)        |
| `draggable` | `boolean`  | No       | Enable drag (default: true) |
| `onDrop`    | `function` | No       | Drop handler                |

### Drag Data

```javascript
{
  type: 'TABLE',
  tableId: 'table-123',
  name: 'customers.csv',
  columnCount: 10,
  rowCount: 1000
}
```

## TableHeader

Header component with table metadata and actions.

### Props

| Prop          | Type      | Required | Description            |
| ------------- | --------- | -------- | ---------------------- |
| `tableId`     | `string`  | Yes      | Table identifier       |
| `table`       | `object`  | No       | Table data             |
| `showActions` | `boolean` | No       | Display action buttons |

### Header Layout

```
┌────────────────────────────────────────────────────────────┐
│ 📊 customers.csv                 1,000 rows  [🎯] [⋯] [🗑] │
│ ↑   ↑                              ↑          ↑    ↑   ↑   │
│ Icon Name                      Row Count   Focus Menu Del  │
└────────────────────────────────────────────────────────────┘
```

## TableSchemaToolbar

Toolbar with table-level actions.

### Props

| Prop          | Type       | Required | Description             |
| ------------- | ---------- | -------- | ----------------------- |
| `tableId`     | `string`   | Yes      | Table identifier        |
| `onSearch`    | `function` | No       | Search handler          |
| `hiddenCount` | `number`   | No       | Count of hidden columns |

### Toolbar Actions

| Action | Icon | Description              |
| ------ | ---- | ------------------------ |
| Search | 🔍   | Filter columns by name   |
| Hidden | 👁    | Show/hide hidden columns |
| Export | 📥   | Export table data        |
| Delete | 🗑    | Remove table             |

## TableName

Editable table name component.

### Props

| Prop       | Type       | Required | Description      |
| ---------- | ---------- | -------- | ---------------- |
| `tableId`  | `string`   | Yes      | Table identifier |
| `name`     | `string`   | Yes      | Current name     |
| `editable` | `boolean`  | No       | Allow editing    |
| `onRename` | `function` | No       | Rename handler   |

## Usage Examples

### Basic Table Display

```jsx
import { EnhancedTableSchema } from "../components/TableView";

function TablePanel({ tableId }) {
  return (
    <div className="table-panel">
      <EnhancedTableSchema tableId={tableId} showRows />
    </div>
  );
}
```

### Compact Table Block

```jsx
import { EnhancedTableBlock } from "../components/TableView";

function DraggableTableCard({ tableId }) {
  return <EnhancedTableBlock tableId={tableId} draggable compact />;
}
```

### Table Rows with Sorting

```jsx
import { TableRows } from "../components/TableView";

function SortableTableView({ tableId, columns }) {
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDir, setSortDir] = useState("asc");

  const handleSort = (column) => {
    if (column === sortColumn) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDir("asc");
    }
  };

  return (
    <TableRows
      tableId={tableId}
      columns={columns}
      sortColumn={sortColumn}
      sortDirection={sortDir}
      onSort={handleSort}
    />
  );
}
```

### Table with Hidden Columns

```jsx
function TableWithHiddenColumns({ tableId }) {
  const [showHidden, setShowHidden] = useState(false);
  const hiddenColumns = useSelector((state) =>
    selectHiddenColumns(state, tableId)
  );

  return (
    <>
      <TableSchemaToolbar
        tableId={tableId}
        hiddenCount={hiddenColumns.length}
        onToggleHidden={() => setShowHidden(!showHidden)}
      />
      <EnhancedTableSchema tableId={tableId} showHiddenColumns={showHidden} />
    </>
  );
}
```

## Redux Integration

```javascript
// Selectors from tablesSlice
selectTableById(state, tableId);
selectTableColumns(state, tableId);
selectTableRowCount(state, tableId);
selectVisibleColumns(state, tableId);
selectHiddenColumns(state, tableId);

// Actions
renameTable({ tableId, name });
removeTable(tableId);
hideColumn({ tableId, columnId });
showColumn({ tableId, columnId });
```

## HOC Integration

```jsx
import { withTableData, withTableSchemaData } from "../HOC";

// withTableData injects:
// - table: Table metadata object
// - columns: Array of column objects

// withTableSchemaData injects:
// - schema: Full schema with types
// - columnIds: Ordered column IDs

export const EnhancedTableSchema = withTableData(TableSchema);
```

## Related Components

- **ColumnViews** - Individual column display
- **TablesList** - List of all source tables
- **PackSchemaView** - Uses tables in PACK operations
- **StackSchemaView** - Uses tables in STACK operations

## Performance Considerations

1. **Row Virtualization**: Only visible rows are rendered
2. **Column Memoization**: Column cells are memoized
3. **Lazy Statistics**: Column stats computed on demand
4. **Incremental Loading**: Rows loaded in pages
