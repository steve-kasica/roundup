# Column Views

This directory contains components for displaying and interacting with column metadata, statistics, and visual representations. These components handle individual column display within table schemas and operation views.

## Directory Structure

```
ColumnViews/
├── ColumnAccordionHeader.jsx   # Expandable column list header
├── ColumnAccordionList.jsx     # Accordion container for columns
├── ColumnCard.jsx              # Card-style column display
├── ColumnDetails.jsx           # Detailed column info panel (332 lines)
├── ColumnHeader.jsx            # Column header with actions
├── ColumnHeaderStack.jsx       # Stacked multi-source column header
├── ColumnListItem.jsx          # List item for column display
├── ColumnName.jsx              # Column name with type icon
├── DraggableColumnRow.jsx      # Drag-enabled column row
├── DropZoneRow.jsx             # Drop target for column reorder
├── StackColumnDetail.jsx       # Stack operation column details
├── UnmatchedValuesBar.jsx      # Visual bar for unmatched values
├── index.js                    # Public exports
└── README.md                   # This file
```

## Components Overview

| Component            | Purpose                       | Key Features                            |
| -------------------- | ----------------------------- | --------------------------------------- |
| `ColumnDetails`      | Full column information panel | Statistics, value distribution, actions |
| `ColumnHeader`       | Header row with column name   | Type icon, menu, selection              |
| `ColumnHeaderStack`  | Multi-source column display   | Source indicators, combined view        |
| `ColumnCard`         | Compact column card           | Drag source, quick actions              |
| `ColumnListItem`     | List-style column display     | Compact, selectable                     |
| `DraggableColumnRow` | Drag-enabled table row        | react-dnd integration                   |

## ColumnDetails

The most comprehensive column display component, showing complete metadata and statistics.

### Props

| Prop          | Type      | Required | Description                   |
| ------------- | --------- | -------- | ----------------------------- |
| `columnId`    | `string`  | Yes      | Column identifier             |
| `column`      | `object`  | No       | Column data (injected by HOC) |
| `showActions` | `boolean` | No       | Display action buttons        |
| `expanded`    | `boolean` | No       | Initially expanded state      |

### Column Object Structure

```javascript
{
  id: 'col-123',
  name: 'customer_id',
  type: 'integer',              // Data type
  tableId: 'table-456',         // Source table
  operationId: 'op-789',        // Parent operation (if any)
  stats: {
    count: 1000,
    nullCount: 5,
    uniqueCount: 995,
    min: 1,
    max: 1000,
    mean: 500.5                 // Numeric columns only
  },
  valueDistribution: {...}      // For categorical columns
}
```

### Displayed Information

1. **Header**: Column name with type icon and actions
2. **Statistics Panel**: Count, nulls, unique values
3. **Value Distribution**: Bar chart for top values
4. **Source Info**: Table origin and lineage
5. **Alerts**: Any column-specific alerts

## ColumnHeader

Standard column header with consistent styling and interactive elements.

### Props

| Prop       | Type       | Required | Description              |
| ---------- | ---------- | -------- | ------------------------ |
| `columnId` | `string`   | Yes      | Column identifier        |
| `column`   | `object`   | No       | Column data (via HOC)    |
| `selected` | `boolean`  | No       | Selection state          |
| `onSelect` | `function` | No       | Selection handler        |
| `showMenu` | `boolean`  | No       | Show context menu button |

### Header Layout

```
┌──────────────────────────────────────────────────┐
│ 📊 column_name                    [⋮] [☑] [👁]  │
│ ↑   ↑                              ↑   ↑    ↑   │
│ Type Name                        Menu Sel Hide  │
└──────────────────────────────────────────────────┘
```

## ColumnHeaderStack

Specialized header for STACK operation columns showing source contributions.

### Props

| Prop       | Type       | Required | Description                 |
| ---------- | ---------- | -------- | --------------------------- |
| `columnId` | `string`   | Yes      | Stack column identifier     |
| `sources`  | `object[]` | No       | Contributing source columns |

### Stacked Display

```
┌──────────────────────────────────────────────────┐
│ column_name                                      │
│ ├─ Table A: original_col (100%)                 │
│ ├─ Table B: alt_name (98%)                      │
│ └─ Table C: — (missing)                         │
└──────────────────────────────────────────────────┘
```

## DraggableColumnRow

Enables drag-and-drop for column reordering and grouping.

### Props

| Prop       | Type       | Required | Description      |
| ---------- | ---------- | -------- | ---------------- |
| `columnId` | `string`   | Yes      | Column to drag   |
| `index`    | `number`   | Yes      | Current position |
| `onMove`   | `function` | Yes      | Reorder handler  |

### Drag Data

```javascript
{
  type: 'COLUMN',
  columnId: 'col-123',
  sourceTableId: 'table-456',
  index: 2
}
```

## HOC Integration

Most components have Enhanced versions with automatic Redux data injection:

```jsx
// With HOC - data injected automatically
import { EnhancedColumnHeader } from "../ColumnViews";
<EnhancedColumnHeader columnId={id} />;

// Without HOC - manual data passing
import { ColumnHeader } from "../ColumnViews";
const column = useSelector((state) => selectColumnById(state, id));
<ColumnHeader columnId={id} column={column} />;
```

## Usage Examples

### Column List with Selection

```jsx
import { EnhancedColumnHeader } from "../components/ColumnViews";

function ColumnList({ columnIds, selectedIds, onToggle }) {
  return (
    <div>
      {columnIds.map((id) => (
        <EnhancedColumnHeader
          key={id}
          columnId={id}
          selected={selectedIds.includes(id)}
          onSelect={() => onToggle(id)}
          showMenu
        />
      ))}
    </div>
  );
}
```

### Expandable Column Details

```jsx
import { EnhancedColumnDetails } from "../components/ColumnViews";

function ColumnExplorer({ columnId }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <EnhancedColumnDetails
      columnId={columnId}
      expanded={expanded}
      onToggle={() => setExpanded(!expanded)}
      showActions
    />
  );
}
```

### Draggable Column Grid

```jsx
import { DraggableColumnRow } from "../components/ColumnViews";

function ReorderableColumns({ columns, onReorder }) {
  return (
    <DndProvider backend={HTML5Backend}>
      {columns.map((col, index) => (
        <DraggableColumnRow
          key={col.id}
          columnId={col.id}
          index={index}
          onMove={onReorder}
        />
      ))}
    </DndProvider>
  );
}
```

## Column Types and Icons

| Type       | Icon | Description       |
| ---------- | ---- | ----------------- |
| `string`   | Abc  | Text data         |
| `integer`  | #    | Whole numbers     |
| `float`    | #.#  | Decimal numbers   |
| `boolean`  | ✓/✗  | True/false values |
| `date`     | 📅   | Date values       |
| `datetime` | 🕐   | Date with time    |

## Related Components

- **TableSchema** (`TableView/`) - Contains column lists
- **PackSchemaView** (`PackOperationView/`) - Column matching
- **StackSchemaView** (`StackOperationView/`) - Column alignment
- **ColumnTypeIcon** (`ui/`) - Type icon rendering

## Redux Integration

```javascript
// Selectors from columnsSlice
selectColumnById(state, columnId);
selectColumnsByTable(state, tableId);
selectColumnsByOperation(state, operationId);
selectVisibleColumns(state, tableId);

// Actions
hideColumn(columnId);
showColumn(columnId);
renameColumn({ columnId, name });
```
