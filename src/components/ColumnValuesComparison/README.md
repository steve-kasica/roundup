# ColumnValuesComparison Components

This directory contains components for analyzing and visualizing column value distributions across multiple tables. These tools help users understand overlap patterns, identify matching columns, and assess data quality during PACK (join) operations.

## Directory Structure

```
ColumnValuesComparison/
├── ColumnValuesComparison.jsx  # Main comparison component
├── JaccardMatrix.jsx           # Similarity matrix heatmap
├── UpsetPlot.jsx               # Set intersection visualization
├── ValueMatrix.jsx             # Value co-occurrence matrix
├── index.js                    # Public exports
└── README.md                   # This file
```

## Components Overview

| Component                | Purpose                        | Key Features                       |
| ------------------------ | ------------------------------ | ---------------------------------- |
| `ColumnValuesComparison` | Container for comparison tools | Tab interface, column selection    |
| `JaccardMatrix`          | Similarity heatmap             | Jaccard index, clickable cells     |
| `UpsetPlot`              | Set intersection chart         | Multi-set overlaps, sorted by size |
| `ValueMatrix`            | Value co-occurrence grid       | Sparse matrix, scrollable          |

## ColumnValuesComparison

The main container component providing a tabbed interface for different comparison views.

### Props

| Prop          | Type       | Required | Description                    |
| ------------- | ---------- | -------- | ------------------------------ |
| `columns`     | `string[]` | Yes      | Array of column IDs to compare |
| `operationId` | `string`   | Yes      | Parent operation context       |

### Features

- **Tab Navigation**: Switch between Jaccard, Upset, and Value views
- **Column Selection**: Choose which columns to include in comparison
- **Lazy Loading**: Data fetched only when view is active
- **Responsive Layout**: Adapts to container width

## JaccardMatrix

Displays pairwise similarity between columns using the Jaccard similarity index.

### Props

| Prop          | Type       | Required | Description                |
| ------------- | ---------- | -------- | -------------------------- |
| `columnIds`   | `string[]` | Yes      | Columns to compare         |
| `onCellClick` | `function` | No       | Handler for cell selection |

### Jaccard Index Formula

The Jaccard similarity coefficient measures overlap between two sets:

$$J(A, B) = \frac{|A \cap B|}{|A \cup B|}$$

Where:

- $|A \cap B|$ = number of values in both columns
- $|A \cup B|$ = number of unique values across both columns

### Heatmap Color Scale

| Value Range | Color       | Interpretation                     |
| ----------- | ----------- | ---------------------------------- |
| 0.8 - 1.0   | Dark Green  | High similarity (likely same data) |
| 0.5 - 0.8   | Light Green | Moderate overlap                   |
| 0.2 - 0.5   | Yellow      | Low similarity                     |
| 0.0 - 0.2   | Red         | Very different values              |

## UpsetPlot

Visualizes multi-set intersections using the UpSet technique (superior to Venn diagrams for >3 sets).

### Props

| Prop               | Type       | Required | Description                   |
| ------------------ | ---------- | -------- | ----------------------------- |
| `columnIds`        | `string[]` | Yes      | Columns (sets) to analyze     |
| `maxIntersections` | `number`   | No       | Limit displayed intersections |

### Reading the Plot

```
            Intersection Size (bar height)
                    ↓
  ┌─────────────────────────────────────┐
  │    ███                              │
  │    ███  ██                          │
  │    ███  ██  █   █                   │
  └─────────────────────────────────────┘
         ●   ●   ●   ●   ← Column membership
         ●       ●
             ●   ●
  ───────────────────
  Col1 Col2 Col3 Col4
```

- **Bar height**: Number of values in that intersection
- **Dots below**: Which columns share those values
- **Connected dots**: Multi-column intersection

## ValueMatrix

Sparse matrix showing which values appear in which columns.

### Props

| Prop           | Type       | Required | Description                 |
| -------------- | ---------- | -------- | --------------------------- |
| `columnIds`    | `string[]` | Yes      | Columns for matrix          |
| `maxRows`      | `number`   | No       | Limit displayed values      |
| `onValueClick` | `function` | No       | Handler for value selection |

### Matrix Structure

```
              Column A   Column B   Column C
  Value 1        ●                     ●
  Value 2        ●          ●          ●
  Value 3                   ●
  Value 4        ●          ●
```

## Usage Examples

### Basic Comparison

```jsx
import { ColumnValuesComparison } from "../components/ColumnValuesComparison";

function CompareColumns({ operationId, selectedColumns }) {
  return (
    <ColumnValuesComparison
      columns={selectedColumns}
      operationId={operationId}
    />
  );
}
```

### Jaccard Matrix with Selection

```jsx
import { JaccardMatrix } from "../components/ColumnValuesComparison";

function SimilarityView({ columns, onSelectPair }) {
  const handleCellClick = (col1, col2, similarity) => {
    if (similarity > 0.5) {
      onSelectPair([col1, col2]);
    }
  };

  return <JaccardMatrix columnIds={columns} onCellClick={handleCellClick} />;
}
```

### Upset Plot for Key Analysis

```jsx
import { UpsetPlot } from "../components/ColumnValuesComparison";

function KeyColumnAnalysis({ keyColumns }) {
  // Show which values exist across multiple potential key columns
  return <UpsetPlot columnIds={keyColumns} maxIntersections={20} />;
}
```

## Data Fetching

These components use the `useColumnValues` hook to fetch data from DuckDB:

```javascript
const {
  values, // Set of unique values
  isLoading, // Loading state
  error, // Error if query failed
} = useColumnValues(columnId);
```

## Performance Considerations

1. **Large Datasets**: Comparison operations are O(n²) for pairwise analysis
2. **Value Limits**: ValueMatrix caps displayed rows for performance
3. **Lazy Loading**: Data is fetched only when component mounts
4. **Memoization**: Similarity calculations are cached

## Related Components

- **PackSchemaView** (`PackOperationView/`) - Uses comparison for join analysis
- **ColumnHeader** (`ColumnViews/`) - Links to column comparisons
- **BarChart** (`visualization/`) - Displays value distributions

## Use Cases

1. **Join Key Selection**: Find columns with high Jaccard similarity
2. **Data Quality**: Identify unexpected value overlaps
3. **Deduplication**: Discover redundant columns
4. **Merge Validation**: Verify join produces expected matches
