# Export Composite Table

This directory contains components for exporting the composite table result to various file formats. Users can download the combined data from their STACK/PACK operations as CSV or TSV files.

## Directory Structure

```
ExportCompositeTable/
├── ExportCompositeTable.jsx  # Export container/button
├── ExportDialog.jsx          # Format selection dialog (150 lines)
├── index.js                  # Public exports
└── README.md                 # This file
```

## Components

### ExportCompositeTable

Container component that triggers the export flow.

| Prop          | Type      | Required | Description                          |
| ------------- | --------- | -------- | ------------------------------------ |
| `operationId` | `string`  | Yes      | Operation to export                  |
| `disabled`    | `boolean` | No       | Disable export (e.g., during errors) |

### ExportDialog

Modal dialog for configuring export options.

| Prop          | Type       | Required | Description             |
| ------------- | ---------- | -------- | ----------------------- |
| `open`        | `boolean`  | Yes      | Dialog visibility       |
| `onClose`     | `function` | Yes      | Close handler           |
| `operationId` | `string`   | Yes      | Operation to export     |
| `onExport`    | `function` | Yes      | Export trigger callback |

## Export Options

### File Formats

| Format | Extension | Description            |
| ------ | --------- | ---------------------- |
| CSV    | `.csv`    | Comma-separated values |
| TSV    | `.tsv`    | Tab-separated values   |

### Configuration Options

```javascript
{
  format: 'csv',              // 'csv' | 'tsv'
  includeHeaders: true,       // Include column names as first row
  selectedColumns: [...],     // Subset of columns (optional)
  filename: 'export.csv'      // Output filename
}
```

## Export Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     EXPORT FLOW                             │
│                                                             │
│  1. User clicks Export button                               │
│                    ↓                                        │
│  2. ExportDialog opens with options                         │
│                    ↓                                        │
│  3. User selects format and columns                         │
│                    ↓                                        │
│  4. DuckDB query generates result                           │
│                    ↓                                        │
│  5. File downloaded to browser                              │
└─────────────────────────────────────────────────────────────┘
```

## Usage Examples

### Basic Export Button

```jsx
import { ExportCompositeTable } from "../components/ExportCompositeTable";

function SchemaToolbar({ operationId, hasErrors }) {
  return (
    <Toolbar>
      <ExportCompositeTable operationId={operationId} disabled={hasErrors} />
    </Toolbar>
  );
}
```

### Custom Export Trigger

```jsx
import { ExportDialog } from "../components/ExportCompositeTable";

function CustomExport({ operationId }) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleExport = async (options) => {
    // Custom export logic
    const data = await queryDuckDB(operationId, options);
    downloadFile(data, options.filename);
    setDialogOpen(false);
  };

  return (
    <>
      <Button onClick={() => setDialogOpen(true)}>Export Data</Button>
      <ExportDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        operationId={operationId}
        onExport={handleExport}
      />
    </>
  );
}
```

### Column Selection

```jsx
function ExportWithColumnSelection({ operationId, columns }) {
  const [selected, setSelected] = useState(columns.map((c) => c.id));

  return (
    <ExportDialog
      open={true}
      operationId={operationId}
      selectedColumns={selected}
      onColumnToggle={(colId) => {
        setSelected((prev) =>
          prev.includes(colId)
            ? prev.filter((id) => id !== colId)
            : [...prev, colId]
        );
      }}
    />
  );
}
```

## Dialog Layout

```
┌─────────────────────────────────────────────┐
│              Export Table                    │
├─────────────────────────────────────────────┤
│                                             │
│  Format:  ○ CSV  ● TSV                      │
│                                             │
│  ☑ Include column headers                   │
│                                             │
│  Columns to export:                         │
│  ☑ customer_id                              │
│  ☑ customer_name                            │
│  ☐ internal_notes (hidden)                  │
│  ☑ order_total                              │
│                                             │
│  Filename: composite_export.csv             │
│                                             │
├─────────────────────────────────────────────┤
│               [Cancel]  [Export]            │
└─────────────────────────────────────────────┘
```

## DuckDB Integration

Export queries the materialized view in DuckDB:

```javascript
// Generate export query
const query = `
  COPY (
    SELECT ${selectedColumns.join(", ")}
    FROM ${operationViewName}
  ) TO '${filename}'
  WITH (FORMAT '${format}', HEADER ${includeHeaders})
`;

// Execute via DuckDB service
const result = await duckdb.query(query);
```

## Related Components

- **ExportTableButton** (`ui/buttons/`) - Toolbar export button
- **ExportTableDialog** (`ui/dialogs/`) - Alternative dialog component
- **TableView** - Shows data before export
- **SchemaToolbar** (`ui/`) - Contains export controls

## Error Handling

| Error            | Handling                            |
| ---------------- | ----------------------------------- |
| Schema errors    | Export disabled until resolved      |
| Empty result     | Warning shown, export still allowed |
| Query failure    | Error toast with details            |
| Download blocked | Browser popup warning               |

## File Size Considerations

- Large datasets generate files asynchronously
- Progress indicator shown for long exports
- Browser memory limits apply
- Consider pagination for very large tables
