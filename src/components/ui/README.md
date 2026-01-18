# UI Components

This directory contains shared UI components, styled elements, and reusable building blocks used throughout the application. Components are organized into subdirectories by category.

## Directory Structure

```
ui/
├── buttons/                    # Action buttons (18 files)
│   ├── AddPackOperationButton.jsx
│   ├── AddStackOperationButton.jsx
│   ├── ClearSearchTextButton.jsx
│   ├── ColumnContextMenuButton.jsx
│   ├── DeleteColumnsButton.jsx
│   ├── ExportTableButton.jsx
│   ├── FocusIconButton.jsx
│   ├── HiddenColumnsButton.jsx
│   ├── InsertTableInOperationButton.jsx
│   ├── RenameObjectButton.jsx
│   ├── SchemaAlertsButton.jsx
│   ├── SelectToggleIconButton.jsx
│   ├── SilenceAlertButton.jsx
│   ├── SwapTablesButton.jsx
│   ├── TooltipIconButton.jsx
│   ├── UploadTablesButton.jsx
│   └── index.js
├── dialogs/                    # Modal dialogs (4 files)
│   ├── ExportTableDialog.jsx
│   ├── FreeTextDialog.jsx
│   ├── InsertColumnDialog.jsx
│   └── index.js
├── icons/                      # Custom icons (10 files)
│   ├── AlertErrorIcon.jsx
│   ├── AlertWarningIcon.jsx
│   ├── InfoIcon.jsx
│   ├── NumberIcon.jsx
│   ├── PackOperationIcon.jsx
│   ├── StackOperationIcon.jsx
│   ├── TableIcon.jsx
│   ├── TooltipIconButton.jsx
│   ├── VennDiagram.jsx
│   └── index.js
├── HighlightText/              # Text highlighting (3 files)
│   ├── HighlightText.jsx
│   ├── HighlightText.test.jsx
│   └── index.js
├── Table/                      # Styled table components (11 files)
│   ├── DummyRow.jsx
│   ├── SkeletonRow.jsx
│   ├── StickyTableCell.jsx
│   ├── StyledAlternatingTableRow.jsx
│   ├── StyledTable.jsx
│   ├── StyledTableCell.jsx
│   ├── StyledTableContainer.jsx
│   ├── Table.jsx
│   ├── TableBody.jsx
│   ├── TableHead.jsx
│   └── index.js
├── AnimatedElipse.jsx          # Loading animation
├── ColumnTypeIcon.jsx          # Column type icons
├── DescriptionList.jsx         # Key-value list
├── DraggableTableRow.jsx       # Drag-enabled row
├── DropZone.jsx                # Generic drop target
├── EditableText.jsx            # Inline text editing
├── MaterializeViewIconButton.jsx  # DuckDB sync button
├── SchemaToolbar.jsx           # Schema toolbar
├── SearchTextBox.jsx           # Search input
├── SidebarDropZone.jsx         # Sidebar drop target
├── StyledBlock.js              # Styled block wrapper
├── StyledDraggableRow.jsx      # Styled draggable row
├── StyledDropZone.jsx          # Styled drop zone
└── card.tsx                    # Card component
```

## Buttons

Action buttons with consistent styling and behavior.

### Button Summary

| Button                         | Purpose                  | Icon |
| ------------------------------ | ------------------------ | ---- |
| `AddPackOperationButton`       | Create PACK operation    | ➕   |
| `AddStackOperationButton`      | Create STACK operation   | ➕   |
| `ClearSearchTextButton`        | Clear search input       | ✕    |
| `ColumnContextMenuButton`      | Column actions menu      | ⋯    |
| `DeleteColumnsButton`          | Delete selected columns  | 🗑    |
| `ExportTableButton`            | Export table data        | 📥   |
| `FocusIconButton`              | Focus on object          | 🎯   |
| `HiddenColumnsButton`          | Toggle hidden columns    | 👁    |
| `InsertTableInOperationButton` | Add table to operation   | ➕   |
| `RenameObjectButton`           | Rename table/operation   | ✏    |
| `SchemaAlertsButton`           | Show schema alerts       | ⚠    |
| `SelectToggleIconButton`       | Toggle selection         | ☑    |
| `SilenceAlertButton`           | Silence alert            | 🔇   |
| `SwapTablesButton`             | Swap left/right tables   | ⇄    |
| `TooltipIconButton`            | Icon button with tooltip | —    |
| `UploadTablesButton`           | Upload files             | 📁   |

### Usage Example

```jsx
import {
  AddStackOperationButton,
  ExportTableButton,
  SchemaAlertsButton,
} from "../ui/buttons";

function SchemaToolbar({ operationId }) {
  return (
    <Toolbar>
      <AddStackOperationButton />
      <ExportTableButton operationId={operationId} />
      <SchemaAlertsButton operationId={operationId} />
    </Toolbar>
  );
}
```

## Dialogs

Modal dialogs for user input and confirmations.

### Dialog Summary

| Dialog               | Purpose                | Key Props                        |
| -------------------- | ---------------------- | -------------------------------- |
| `ExportTableDialog`  | Configure table export | `operationId`, `open`, `onClose` |
| `FreeTextDialog`     | Text input dialog      | `title`, `value`, `onSubmit`     |
| `InsertColumnDialog` | Add new column         | `tableId`, `onInsert`            |

### Usage Example

```jsx
import { ExportTableDialog } from "../ui/dialogs";

function ExportButton({ operationId }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Export</Button>
      <ExportTableDialog
        open={open}
        onClose={() => setOpen(false)}
        operationId={operationId}
      />
    </>
  );
}
```

## Icons

Custom icons for consistent visual language.

### Icon Summary

| Icon                 | Purpose          | Usage      |
| -------------------- | ---------------- | ---------- |
| `AlertErrorIcon`     | Error severity   | Alerts     |
| `AlertWarningIcon`   | Warning severity | Alerts     |
| `InfoIcon`           | Information      | Tooltips   |
| `NumberIcon`         | Numeric display  | Badges     |
| `PackOperationIcon`  | PACK operation   | Headers    |
| `StackOperationIcon` | STACK operation  | Headers    |
| `TableIcon`          | Table indicator  | Lists      |
| `VennDiagram`        | Match overlap    | PACK stats |

### Usage Example

```jsx
import { StackOperationIcon, TableIcon } from "../ui/icons";

function OperationHeader({ type }) {
  return <div>{type === "STACK" ? <StackOperationIcon /> : <TableIcon />}</div>;
}
```

## Table Components

Styled table components for consistent data display.

### Component Summary

| Component                   | Purpose                 |
| --------------------------- | ----------------------- |
| `StyledTable`               | Base table with styling |
| `StyledTableCell`           | Styled cell             |
| `StyledTableContainer`      | Scrollable container    |
| `StyledAlternatingTableRow` | Zebra-striped rows      |
| `StickyTableCell`           | Fixed header cell       |
| `SkeletonRow`               | Loading placeholder     |
| `DummyRow`                  | Empty placeholder       |
| `Table`                     | Complete table wrapper  |
| `TableHead`                 | Header component        |
| `TableBody`                 | Body component          |

### Usage Example

```jsx
import {
  StyledTable,
  StyledTableCell,
  StyledAlternatingTableRow,
} from "../ui/Table";

function DataTable({ rows, columns }) {
  return (
    <StyledTable>
      <TableHead>
        <tr>
          {columns.map((col) => (
            <StyledTableCell key={col.id}>{col.name}</StyledTableCell>
          ))}
        </tr>
      </TableHead>
      <TableBody>
        {rows.map((row, i) => (
          <StyledAlternatingTableRow key={i}>
            {columns.map((col) => (
              <StyledTableCell key={col.id}>{row[col.id]}</StyledTableCell>
            ))}
          </StyledAlternatingTableRow>
        ))}
      </TableBody>
    </StyledTable>
  );
}
```

## HighlightText

Text component with search term highlighting.

### Props

| Prop            | Type      | Description              |
| --------------- | --------- | ------------------------ |
| `text`          | `string`  | Text to display          |
| `highlight`     | `string`  | Search term to highlight |
| `caseSensitive` | `boolean` | Case-sensitive matching  |

### Usage Example

```jsx
import { HighlightText } from "../ui/HighlightText";

function SearchResult({ text, searchTerm }) {
  return <HighlightText text={text} highlight={searchTerm} />;
}
// "customer_id" with search "cust" renders:
// <span><mark>cust</mark>omer_id</span>
```

## Standalone Components

### ColumnTypeIcon

Displays icon for column data types.

```jsx
import { ColumnTypeIcon } from '../ui';

<ColumnTypeIcon type="string" />   // Abc
<ColumnTypeIcon type="integer" />  // #
<ColumnTypeIcon type="float" />    // #.#
<ColumnTypeIcon type="boolean" />  // ✓
<ColumnTypeIcon type="date" />     // 📅
```

### EditableText

Inline editable text component.

```jsx
import { EditableText } from "../ui";

<EditableText value={name} onSave={handleRename} placeholder="Enter name..." />;
```

### SearchTextBox

Search input with clear button.

```jsx
import { SearchTextBox } from "../ui";

<SearchTextBox
  value={search}
  onChange={setSearch}
  placeholder="Search columns..."
/>;
```

### DropZone

Generic drop target for drag-and-drop.

```jsx
import { DropZone } from "../ui";

<DropZone accept={["TABLE", "COLUMN"]} onDrop={handleDrop}>
  Drop items here
</DropZone>;
```

### SchemaToolbar

Toolbar for schema-level actions.

```jsx
import { SchemaToolbar } from "../ui";

<SchemaToolbar
  onSearch={setSearchText}
  onExport={handleExport}
  errorCount={errors.length}
/>;
```

## Design Patterns

### Consistent Styling

All components use Material-UI's `sx` prop or styled-components for consistent theming:

```jsx
// Using sx prop
<Box sx={{ p: 2, bgcolor: "background.paper" }}>Content</Box>;

// Using styled
const StyledButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
}));
```

### Tooltip Pattern

Action buttons include tooltips for accessibility:

```jsx
<Tooltip title="Delete column">
  <IconButton onClick={handleDelete}>
    <DeleteIcon />
  </IconButton>
</Tooltip>
```

### Loading States

Components handle loading with skeletons:

```jsx
function DataCell({ loading, value }) {
  if (loading) {
    return <Skeleton width={100} />;
  }
  return <span>{value}</span>;
}
```

## Related Directories

- **visualization/** - Chart components
- **ColumnViews/** - Column-specific UI
- **TableView/** - Table-specific UI
- **HOC/** - Data injection wrappers
