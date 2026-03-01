# Stack Operation View

This directory contains components for displaying and interacting with STACK (union) operations. STACK combines multiple tables vertically by aligning columns with matching names, similar to SQL UNION operations.

## Directory Structure

```
StackOperationView/
├── ColumnContainer/           # Column matrix container
│   ├── ColumnContainer.jsx   # Container for column alignment
│   ├── StyledPaper.jsx       # Styled paper wrapper
│   └── index.js              # Exports
├── StackSchemaView/          # Main schema view (542 lines)
│   ├── StackSchemaView.jsx   # Primary schema component
│   ├── StyledColumnsContainer.js
│   └── index.js              # Exports
├── selectionUtils/           # Range selection utilities
├── MetadataView.jsx          # Table metadata display
├── StackOperationBlock.jsx   # Operation block wrapper
├── StackOperationLabel.jsx   # Operation label display
├── StackParametersForm.jsx   # Stack configuration form
├── StackRows.jsx             # Combined row data (203 lines)
├── StackSchemaToolbar.jsx    # Schema toolbar actions
├── index.js                  # Public exports
└── README.md                 # This file
```

## Components Overview

| Component             | Purpose             | Key Features                        |
| --------------------- | ------------------- | ----------------------------------- |
| `StackSchemaView`     | Main STACK display  | Column matrix, alignment, actions   |
| `StackRows`           | Combined row data   | Virtualized, source highlighting    |
| `ColumnContainer`     | Column alignment UI | Drag-drop, range selection          |
| `StackSchemaToolbar`  | Toolbar actions     | Add/remove tables, settings         |
| `StackParametersForm` | Configuration       | Duplicate handling, column matching |

## StackSchemaView

The primary component for STACK operations, showing the column alignment matrix.

### Props

| Prop          | Type      | Required | Description                |
| ------------- | --------- | -------- | -------------------------- |
| `operationId` | `string`  | Yes      | STACK operation identifier |
| `operation`   | `object`  | No       | Operation data (via HOC)   |
| `compact`     | `boolean` | No       | Use compact layout         |

### Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│                    STACK OPERATION                          │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                  Column Matrix                          ││
│  │                                                         ││
│  │              Output      Table A    Table B    Table C  ││
│  │           ┌─────────┬──────────┬──────────┬──────────┐  ││
│  │  Row 1    │   id    │    id    │    id    │    id    │  ││
│  │           ├─────────┼──────────┼──────────┼──────────┤  ││
│  │  Row 2    │  name   │   name   │  title   │   name   │  ││
│  │           ├─────────┼──────────┼──────────┼──────────┤  ││
│  │  Row 3    │  email  │  email   │    —     │  email   │  ││
│  │           ├─────────┼──────────┼──────────┼──────────┤  ││
│  │  Row 4    │  phone  │    —     │    —     │  phone   │  ││
│  │           └─────────┴──────────┴──────────┴──────────┘  ││
│  │                                                         ││
│  │  Legend: ● Present  — Missing                           ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Row Counts: A=500  B=300  C=200  Total=1000            ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

## Column Matrix

The column matrix shows how columns from each source table map to the output schema.

### Matrix Cell States

| State    | Display             | Description                   |
| -------- | ------------------- | ----------------------------- |
| Present  | Column name         | Column exists in source table |
| Missing  | `—`                 | Column not in source table    |
| Renamed  | `oldName → newName` | Column mapped with rename     |
| Selected | Highlighted         | Currently selected for action |

### Matrix Structure

```javascript
{
  outputColumns: [
    { id: 'out-1', name: 'id', type: 'integer' },
    { id: 'out-2', name: 'name', type: 'string' },
    { id: 'out-3', name: 'email', type: 'string' }
  ],
  columnMappings: {
    'table-1': {
      'out-1': 'col-1',  // id → id
      'out-2': 'col-2',  // name → name
      'out-3': 'col-3'   // email → email
    },
    'table-2': {
      'out-1': 'col-5',  // id → id
      'out-2': 'col-6',  // title → name (renamed)
      'out-3': null      // missing
    }
  }
}
```

## ColumnContainer

Container for displaying and managing column alignments with drag-and-drop.

### Props

| Prop             | Type       | Required | Description              |
| ---------------- | ---------- | -------- | ------------------------ |
| `operationId`    | `string`   | Yes      | STACK operation          |
| `outputColumnId` | `string`   | Yes      | Output column            |
| `sourceColumns`  | `object[]` | No       | Mapped source columns    |
| `onDrop`         | `function` | No       | Drop handler for reorder |

### Drag and Drop

```
┌──────────────────────────────────────────────────┐
│  Output Column: customer_id                       │
│  ┌──────────────────────────────────────────────┐│
│  │ ⋮⋮ Table A: customer_id                      ││ ← Draggable
│  │ ⋮⋮ Table B: cust_id                          ││ ← Draggable
│  │ ⋮⋮ Table C: —                     [+ Map]    ││ ← Drop target
│  └──────────────────────────────────────────────┘│
└──────────────────────────────────────────────────┘
```

## Range Selection

The matrix supports range selection for bulk operations:

### Selection Utilities

```javascript
// Select range of cells
selectRange(startRow, startCol, endRow, endCol);

// Get selected cells
const selected = getSelectedCells();
// Returns: [{ row: 1, col: 2, columnId: 'out-1', tableId: 'table-2' }, ...]

// Apply action to selection
hideSelectedColumns();
remapSelectedColumns();
```

### Selection Modes

| Mode   | Action              | Description              |
| ------ | ------------------- | ------------------------ |
| Single | Click               | Select one cell          |
| Range  | Shift+Click         | Select rectangular range |
| Add    | Ctrl+Click          | Add to selection         |
| Row    | Row header click    | Select entire row        |
| Column | Column header click | Select entire column     |

## StackRows

Virtualized table displaying combined row data from all source tables.

### Props

| Prop             | Type      | Required | Description                  |
| ---------------- | --------- | -------- | ---------------------------- |
| `operationId`    | `string`  | Yes      | STACK operation              |
| `showSource`     | `boolean` | No       | Show source table column     |
| `pageSize`       | `number`  | No       | Rows per page (default: 100) |
| `highlightTable` | `string`  | No       | Highlight rows from table    |

### Row Display

```
┌─────────────────────────────────────────────────────────────┐
│ [Source] │ id   │ name      │ email              │ phone    │
├─────────────────────────────────────────────────────────────┤
│ Table A  │ 001  │ Alice     │ alice@example.com  │ 555-0001 │
│ Table A  │ 002  │ Bob       │ bob@example.com    │ 555-0002 │
│ Table B  │ 101  │ Carol     │ —                  │ —        │
│ Table B  │ 102  │ Dave      │ —                  │ —        │
│ Table C  │ 201  │ Eve       │ eve@example.com    │ 555-0003 │
└─────────────────────────────────────────────────────────────┘
```

## StackParametersForm

Configuration form for STACK operation settings.

### Props

| Prop          | Type       | Required | Description        |
| ------------- | ---------- | -------- | ------------------ |
| `operationId` | `string`   | Yes      | STACK operation    |
| `parameters`  | `object`   | No       | Current parameters |
| `onChange`    | `function` | Yes      | Change handler     |

### Configuration Options

| Option              | Type                   | Description                    |
| ------------------- | ---------------------- | ------------------------------ |
| `matchMode`         | `'name' \| 'position'` | How to match columns           |
| `duplicateHandling` | `'keep' \| 'remove'`   | Handle duplicate rows          |
| `missingValue`      | `string`               | Value for missing columns      |
| `caseSensitive`     | `boolean`              | Case-sensitive column matching |

## Usage Examples

### Basic STACK View

```jsx
import { EnhancedStackSchemaView } from "../components/StackOperationView";

function StackOperationPanel({ operationId }) {
  return (
    <div className="stack-panel">
      <EnhancedStackSchemaView operationId={operationId} />
    </div>
  );
}
```

### Column Matrix with Selection

```jsx
import { StackSchemaView } from "../components/StackOperationView/StackSchemaView";

function InteractiveMatrix({ operationId }) {
  const [selection, setSelection] = useState([]);

  const handleSelectionChange = (newSelection) => {
    setSelection(newSelection);
  };

  return (
    <>
      <StackSchemaView
        operationId={operationId}
        onSelectionChange={handleSelectionChange}
      />
      {selection.length > 0 && (
        <SelectionActions
          selection={selection}
          onHide={() => hideColumns(selection)}
          onRemap={() => openRemapDialog(selection)}
        />
      )}
    </>
  );
}
```

### Stacked Rows with Source Highlighting

```jsx
import { StackRows } from "../components/StackOperationView";

function StackedDataView({ operationId, tables }) {
  const [highlightedTable, setHighlightedTable] = useState(null);

  return (
    <div>
      <TableSelector tables={tables} onSelect={setHighlightedTable} />
      <StackRows
        operationId={operationId}
        showSource
        highlightTable={highlightedTable}
      />
    </div>
  );
}
```

## Redux Integration

```javascript
// Selectors from operationsSlice
selectStackOperation(state, operationId);
selectStackColumnMatrix(state, operationId);
selectStackTables(state, operationId);
selectStackOutputColumns(state, operationId);

// Actions
updateStackColumnMapping({
  operationId,
  outputColumnId,
  tableId,
  sourceColumnId,
});
addStackOutputColumn({ operationId, name, type });
removeStackOutputColumn({ operationId, outputColumnId });
reorderStackOutputColumns({ operationId, columnIds });
```

## HOC Integration

```jsx
import { withStackOperationData } from "../HOC";

// Injected props:
// - columnMatrix: Column alignment matrix
// - tables: Source tables array
// - outputColumns: Output schema columns
// - rowCounts: Row counts per source table

export const EnhancedStackSchemaView = withStackOperationData(StackSchemaView);
```

## Related Components

- **PackSchemaView** (`PackOperationView/`) - PACK operation display
- **ColumnViews** - Individual column display
- **TableView** - Single table display
- **ColumnValuesComparison** - Value overlap analysis

## Performance Considerations

1. **Virtualized Matrix**: Large column counts use virtualization
2. **Lazy Row Loading**: StackRows uses pagination
3. **Memoized Cells**: Matrix cells memoized for performance
4. **Incremental Updates**: Only recompute changed mappings
