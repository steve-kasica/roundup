# Pack Operation View

This directory contains components for displaying and interacting with PACK (join) operations. PACK combines multiple tables horizontally by matching rows on key columns, similar to SQL JOIN operations.

## Directory Structure

```
PackOperationView/
├── PackRows.jsx              # Matched row data display (250 lines)
├── PackSchemaView.jsx        # Main PACK schema view (859 lines)
├── PackSideBySideView.jsx    # Side-by-side table comparison
├── MatchStatsVenn.jsx        # Venn diagram for match statistics
├── KeyColumnSelector.jsx     # Key column selection UI
├── MatchTypeSelector.jsx     # Match type configuration
├── index.js                  # Public exports
└── README.md                 # This file
```

## Components Overview

| Component           | Purpose             | Key Features                         |
| ------------------- | ------------------- | ------------------------------------ |
| `PackSchemaView`    | Main PACK display   | Match stats, key columns, schema     |
| `PackRows`          | Matched row data    | Virtualized table, matched/unmatched |
| `MatchStatsVenn`    | Match visualization | Venn diagram of overlaps             |
| `KeyColumnSelector` | Key selection       | Column picker for join keys          |
| `MatchTypeSelector` | Match configuration | Inner/left/right/full join           |

## PackSchemaView

The primary component for PACK operations, showing complete join configuration and statistics.

### Props

| Prop          | Type      | Required | Description               |
| ------------- | --------- | -------- | ------------------------- |
| `operationId` | `string`  | Yes      | PACK operation identifier |
| `operation`   | `object`  | No       | Operation data (via HOC)  |
| `compact`     | `boolean` | No       | Use compact layout        |

### Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│                    PACK OPERATION                           │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                  Match Statistics                       ││
│  │                                                         ││
│  │     ┌───────────────────────────────────┐               ││
│  │     │    (A)     (A∩B)      (B)         │               ││
│  │     │   250      750        50          │               ││
│  │     │  Left    Matched    Right         │               ││
│  │     │  Only              Only           │               ││
│  │     └───────────────────────────────────┘               ││
│  │                                                         ││
│  │  Total Left: 1000    Total Right: 800   Match Rate: 75% ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  ┌────────────────────┐  ┌────────────────────┐            │
│  │    Key Columns     │  │    Match Type      │            │
│  │  ☑ customer_id     │  │  ● Inner Join      │            │
│  │  ☐ order_date      │  │  ○ Left Join       │            │
│  │                    │  │  ○ Right Join      │            │
│  └────────────────────┘  └────────────────────┘            │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                    Schema View                          ││
│  │  Left Table              Right Table                    ││
│  │  ├─ customer_id ─────────── customer_id                 ││
│  │  ├─ customer_name          order_id                     ││
│  │  ├─ email                  order_total                  ││
│  │  └─ phone                  order_date                   ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

## Match Statistics

PACK operations compute detailed match statistics:

### Statistics Object

```javascript
{
  leftCount: 1000,      // Total rows in left table
  rightCount: 800,      // Total rows in right table
  matchCount: 750,      // Rows that matched
  leftOnlyCount: 250,   // Left rows without matches
  rightOnlyCount: 50,   // Right rows without matches
  matchRate: 0.75       // Match percentage
}
```

### Venn Diagram Representation

```
      ┌─────────────────────────────────┐
      │                                 │
      │   ┌─────────┐   ┌─────────┐    │
      │   │         │   │         │    │
      │   │   250   │750│   50    │    │
      │   │  (A-B)  │(∩)│  (B-A)  │    │
      │   │         │   │         │    │
      │   └─────────┘   └─────────┘    │
      │                                 │
      └─────────────────────────────────┘
           Left Only  Matched  Right Only
```

## MatchStatsVenn

Interactive Venn diagram showing match overlap.

### Props

| Prop             | Type       | Required | Description                   |
| ---------------- | ---------- | -------- | ----------------------------- |
| `stats`          | `object`   | Yes      | Match statistics object       |
| `leftLabel`      | `string`   | No       | Left table name               |
| `rightLabel`     | `string`   | No       | Right table name              |
| `onSegmentClick` | `function` | No       | Handler for segment selection |

### Segment Click Actions

| Segment          | Filter Result             |
| ---------------- | ------------------------- |
| Left Only (A-B)  | Show unmatched left rows  |
| Matched (A∩B)    | Show matched rows         |
| Right Only (B-A) | Show unmatched right rows |
| Left Circle (A)  | Show all left rows        |
| Right Circle (B) | Show all right rows       |

## KeyColumnSelector

Component for selecting and managing join key columns.

### Props

| Prop           | Type       | Required | Description               |
| -------------- | ---------- | -------- | ------------------------- |
| `operationId`  | `string`   | Yes      | PACK operation            |
| `keyColumns`   | `object[]` | No       | Current key column pairs  |
| `leftColumns`  | `object[]` | No       | Available left columns    |
| `rightColumns` | `object[]` | No       | Available right columns   |
| `onKeyChange`  | `function` | Yes      | Key column change handler |

### Key Column Structure

```javascript
[
  {
    leftColumnId: "col-1",
    rightColumnId: "col-5",
    name: "customer_id",
  },
  {
    leftColumnId: "col-2",
    rightColumnId: "col-6",
    name: "date",
  },
];
```

## MatchTypeSelector

Configure the type of join operation.

### Props

| Prop        | Type       | Required | Description        |
| ----------- | ---------- | -------- | ------------------ |
| `matchType` | `string`   | Yes      | Current match type |
| `onChange`  | `function` | Yes      | Change handler     |

### Match Types

| Type    | SQL Equivalent    | Description               |
| ------- | ----------------- | ------------------------- |
| `inner` | `INNER JOIN`      | Only matching rows        |
| `left`  | `LEFT JOIN`       | All left + matching right |
| `right` | `RIGHT JOIN`      | All right + matching left |
| `full`  | `FULL OUTER JOIN` | All rows from both        |

## PackRows

Virtualized table displaying matched row data.

### Props

| Prop          | Type     | Required | Description                               |
| ------------- | -------- | -------- | ----------------------------------------- |
| `operationId` | `string` | Yes      | PACK operation                            |
| `filter`      | `string` | No       | Filter: 'all', 'matched', 'left', 'right' |
| `pageSize`    | `number` | No       | Rows per page (default: 100)              |

### Row Display Modes

```
┌─────────────────────────────────────────────────────────────┐
│ [All] [Matched] [Left Only] [Right Only]                    │
├─────────────────────────────────────────────────────────────┤
│ customer_id │ customer_name │ order_id │ order_total        │
├─────────────────────────────────────────────────────────────┤
│ 001         │ Alice         │ A-101    │ $150.00            │
│ 002         │ Bob           │ A-102    │ $75.50             │
│ 003         │ Carol         │ —        │ —                  │ ← Left only
│ 004         │ Dave          │ A-104    │ $200.00            │
└─────────────────────────────────────────────────────────────┘
```

## Usage Examples

### Basic PACK View

```jsx
import { EnhancedPackSchemaView } from "../components/PackOperationView";

function PackOperationPanel({ operationId }) {
  return (
    <div className="pack-panel">
      <EnhancedPackSchemaView operationId={operationId} />
    </div>
  );
}
```

### Match Stats with Interaction

```jsx
import { MatchStatsVenn } from "../components/PackOperationView";

function MatchStatsPanel({ stats, leftName, rightName, onFilter }) {
  return (
    <MatchStatsVenn
      stats={stats}
      leftLabel={leftName}
      rightLabel={rightName}
      onSegmentClick={(segment) => {
        onFilter(segment); // 'matched', 'left-only', 'right-only'
      }}
    />
  );
}
```

### Key Column Management

```jsx
import { KeyColumnSelector } from "../components/PackOperationView";

function KeyColumnEditor({ operationId, leftCols, rightCols }) {
  const dispatch = useDispatch();

  const handleKeyChange = (newKeys) => {
    dispatch(updatePackKeyColumns({ operationId, keyColumns: newKeys }));
  };

  return (
    <KeyColumnSelector
      operationId={operationId}
      leftColumns={leftCols}
      rightColumns={rightCols}
      onKeyChange={handleKeyChange}
    />
  );
}
```

## Redux Integration

```javascript
// Selectors from operationsSlice
selectPackOperation(state, operationId);
selectPackMatchStats(state, operationId);
selectPackKeyColumns(state, operationId);
selectPackMatchType(state, operationId);

// Actions
updatePackKeyColumns({ operationId, keyColumns });
updatePackMatchType({ operationId, matchType });
```

## HOC Integration

```jsx
import { withPackOperationData } from "../HOC";

// Injected props:
// - matchStats: Match statistics object
// - keyColumns: Current key column pairs
// - leftTable, rightTable: Table references
// - matchType: Join type configuration

export const EnhancedPackSchemaView = withPackOperationData(PackSchemaView);
```

## Related Components

- **StackSchemaView** (`StackOperationView/`) - STACK operation display
- **ColumnValuesComparison** - Jaccard similarity for key selection
- **VennDiagram** (`ui/icons/`) - Venn diagram icon component
- **TableView** - Individual table display

## Performance Considerations

1. **Match Stats Caching**: Statistics cached after initial computation
2. **Lazy Row Loading**: PackRows uses pagination/virtualization
3. **Debounced Key Updates**: Key column changes debounced
4. **Incremental Matching**: Updates only recompute changed portions
