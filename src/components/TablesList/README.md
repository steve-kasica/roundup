# Tables List

This directory contains components for displaying and managing the list of source tables. Users can view all imported tables, upload new data files, and drag tables into operations.

## Directory Structure

```
TablesList/
├── DragDropFileUpload.jsx    # File upload with drag-drop (274 lines)
├── TablesList.jsx            # Main tables list (397 lines)
├── TablesListHeader.jsx      # List header with actions
├── index.js                  # Public exports
└── README.md                 # This file
```

## Components Overview

| Component            | Purpose          | Key Features                        |
| -------------------- | ---------------- | ----------------------------------- |
| `TablesList`         | Main tables list | Table cards, drag source, filtering |
| `DragDropFileUpload` | File upload      | Drag-drop zone, file validation     |
| `TablesListHeader`   | List header      | Search, upload button, count        |

## TablesList

The primary component for displaying all source tables in the workspace.

### Props

| Prop            | Type       | Required | Description                               |
| --------------- | ---------- | -------- | ----------------------------------------- |
| `tableIds`      | `string[]` | No       | Specific tables to show (defaults to all) |
| `searchText`    | `string`   | No       | Filter tables by name                     |
| `onTableSelect` | `function` | No       | Table selection handler                   |
| `draggable`     | `boolean`  | No       | Enable drag-to-operation (default: true)  |

### Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│                     SOURCE TABLES                           │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Search tables...              [Upload Files ▲]        ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  📊 customers.csv                                       ││
│  │     1,000 rows  •  10 columns                    [⋯]   ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  📊 orders.csv                                          ││
│  │     5,000 rows  •  8 columns                     [⋯]   ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  📊 products.csv                                        ││
│  │     200 rows  •  12 columns                      [⋯]   ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐│
│  │  + Drag & drop CSV files here, or click to browse     ││
│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘│
└─────────────────────────────────────────────────────────────┘
```

## DragDropFileUpload

Component for uploading CSV/TSV files via drag-and-drop or file browser.

### Props

| Prop              | Type       | Required | Description                          |
| ----------------- | ---------- | -------- | ------------------------------------ |
| `onFilesAccepted` | `function` | Yes      | Handler for accepted files           |
| `onFileRejected`  | `function` | No       | Handler for rejected files           |
| `acceptedFormats` | `string[]` | No       | Accepted file extensions             |
| `maxFileSize`     | `number`   | No       | Max file size in bytes               |
| `multiple`        | `boolean`  | No       | Allow multiple files (default: true) |

### Accepted File Formats

| Format | Extension | MIME Type                   |
| ------ | --------- | --------------------------- |
| CSV    | `.csv`    | `text/csv`                  |
| TSV    | `.tsv`    | `text/tab-separated-values` |
| Text   | `.txt`    | `text/plain`                |

### Upload States

```
┌─────────────────────────────────────────────────────────────┐
│  IDLE STATE                                                 │
│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐  │
│  │  📁 Drag & drop files here, or click to browse       │  │
│  │     Accepts CSV, TSV (max 100MB)                     │  │
│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  DRAG OVER STATE (highlighted)                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  📁 Drop files to upload                               ││
│  │     2 files ready                                      ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  UPLOADING STATE                                            │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  ⏳ Processing customers.csv...                        ││
│  │     [████████████░░░░░░░░░] 60%                        ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

## TablesListHeader

Header component with search and upload controls.

### Props

| Prop             | Type       | Required | Description           |
| ---------------- | ---------- | -------- | --------------------- |
| `tableCount`     | `number`   | No       | Total table count     |
| `searchText`     | `string`   | No       | Current search filter |
| `onSearchChange` | `function` | No       | Search change handler |
| `onUploadClick`  | `function` | No       | Upload button handler |

### Header Layout

```
┌────────────────────────────────────────────────────────────┐
│  Tables (3)                                                │
│  ┌──────────────────────────────────┐  ┌────────────────┐  │
│  │  🔍 Search tables...             │  │ Upload Files ▲ │  │
│  └──────────────────────────────────┘  └────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

## Table Card Layout

Each table is displayed as a card with metadata:

```
┌────────────────────────────────────────────────────────────┐
│ ⋮⋮ 📊 customers.csv                               [⋯] [🗑] │
│ ↑  ↑   ↑                                           ↑   ↑   │
│ Drag Icon Name                                   Menu Del  │
│                                                            │
│    1,000 rows  •  10 columns  •  Imported 2 hours ago      │
└────────────────────────────────────────────────────────────┘
```

## Drag and Drop

Tables can be dragged to operation drop targets:

### Drag Source

```jsx
// Table card as drag source
<DragSource
  type="TABLE"
  item={{
    tableId: table.id,
    name: table.name,
    rowCount: table.rowCount,
    columnCount: table.columns.length,
  }}
>
  <TableCard table={table} />
</DragSource>
```

### Drop Targets

Tables can be dropped on:

| Target          | Action                          |
| --------------- | ------------------------------- |
| STACK drop zone | Add table to STACK operation    |
| PACK drop zone  | Add table to PACK operation     |
| Empty schema    | Create new operation with table |

## Usage Examples

### Basic Tables List

```jsx
import { TablesList } from "../components/TablesList";

function TablesPanel() {
  return (
    <div className="tables-sidebar">
      <TablesList />
    </div>
  );
}
```

### With Search Filter

```jsx
function FilterableTablesList() {
  const [search, setSearch] = useState("");

  return <TablesList searchText={search} onSearchChange={setSearch} />;
}
```

### File Upload Handler

```jsx
import { DragDropFileUpload } from "../components/TablesList";

function FileUploader() {
  const dispatch = useDispatch();

  const handleFiles = async (files) => {
    for (const file of files) {
      dispatch(importTable({ file }));
    }
  };

  return (
    <DragDropFileUpload
      onFilesAccepted={handleFiles}
      onFileRejected={(file, reason) => {
        toast.error(`${file.name}: ${reason}`);
      }}
      acceptedFormats={[".csv", ".tsv"]}
      maxFileSize={100 * 1024 * 1024} // 100MB
    />
  );
}
```

### Table Selection

```jsx
function SelectableTablesList({ onSelect }) {
  const [selectedId, setSelectedId] = useState(null);

  const handleSelect = (tableId) => {
    setSelectedId(tableId);
    onSelect(tableId);
  };

  return <TablesList onTableSelect={handleSelect} selectedId={selectedId} />;
}
```

## Redux Integration

```javascript
// Selectors from tablesSlice
selectAllTableIds(state); // All table IDs
selectTableById(state, tableId); // Single table
selectTablesSortedByName(state); // Tables sorted alphabetically
selectTablesSortedByDate(state); // Tables sorted by import date

// Actions (via sagas)
importTable({ file }); // Import CSV/TSV file
removeTable(tableId); // Delete table
renameTable({ tableId, name }); // Rename table
```

## File Processing

### Import Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     IMPORT FLOW                             │
│                                                             │
│  1. File dropped/selected                                   │
│                    ↓                                        │
│  2. File validated (format, size)                           │
│                    ↓                                        │
│  3. File parsed (Papa Parse for CSV)                        │
│                    ↓                                        │
│  4. Data loaded into DuckDB                                 │
│                    ↓                                        │
│  5. Schema analyzed (types, stats)                          │
│                    ↓                                        │
│  6. Table added to Redux state                              │
│                    ↓                                        │
│  7. Table appears in list                                   │
└─────────────────────────────────────────────────────────────┘
```

### File Validation

| Check   | Requirement          | Error Message                |
| ------- | -------------------- | ---------------------------- |
| Format  | CSV, TSV, or TXT     | "Unsupported file format"    |
| Size    | < 100MB              | "File too large (max 100MB)" |
| Content | Valid delimiters     | "Unable to parse file"       |
| Headers | First row as headers | "No headers detected"        |

## Related Components

- **TableView** - Detailed table display
- **CompositeTableSchema** - Drop targets for tables
- **TableDropTarget** - Drop zone component
- **UploadTablesButton** (`ui/buttons/`) - Upload trigger button

## Performance Considerations

1. **Lazy Parsing**: Large files parsed incrementally
2. **Background Import**: Imports run in Web Worker
3. **Progress Tracking**: Upload progress shown to user
4. **Chunked Loading**: Very large files loaded in chunks
