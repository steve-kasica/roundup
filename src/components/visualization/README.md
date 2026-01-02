# Visualization Components

This directory contains chart and data visualization components built with D3.js for scales and SVG rendering. These components display data distributions, proportions, and statistical summaries.

## Directory Structure

```
visualization/
├── BarChart.jsx        # Horizontal bar chart (387 lines)
├── ProportionBar.jsx   # Stacked proportion bar (99 lines)
├── index.js            # Public exports
└── README.md           # This file
```

## Components

### BarChart

A comprehensive horizontal bar chart with tooltips, infinite scrolling, and loading states.

#### Props

| Prop                 | Type       | Required | Default     | Description                         |
| -------------------- | ---------- | -------- | ----------- | ----------------------------------- |
| `data`               | `object`   | Yes      | `{}`        | Key-value pairs of labels to values |
| `tooltipData`        | `object`   | No       | `{}`        | Additional tooltip content per bar  |
| `title`              | `string`   | No       | `''`        | Chart title                         |
| `color`              | `string`   | No       | `'#3b82f6'` | Bar fill color                      |
| `xAxisLabel`         | `string`   | No       | `''`        | X-axis label                        |
| `marginTop`          | `number`   | No       | `0`         | Top margin in pixels                |
| `marginRight`        | `number`   | No       | `0`         | Right margin in pixels              |
| `marginBottom`       | `number`   | No       | `0`         | Bottom margin in pixels             |
| `marginLeft`         | `number`   | No       | `0`         | Left margin in pixels               |
| `minHeight`          | `number`   | No       | `300`       | Minimum chart height                |
| `barHeight`          | `number`   | No       | `20`        | Height of each bar                  |
| `barSpacing`         | `number`   | No       | `5`         | Space between bars                  |
| `formatValue`        | `function` | No       | `v => v`    | Value formatter                     |
| `onScrollNearBottom` | `function` | No       | `null`      | Infinite scroll handler             |
| `scrollThreshold`    | `number`   | No       | `0.9`       | Scroll trigger threshold            |
| `isLoading`          | `boolean`  | No       | `false`     | Show loading state                  |

#### Features

- **Horizontal Layout**: Bars extend from left to right
- **D3 Scales**: Linear scale for values, band scale for labels
- **Tooltips**: Hover to see detailed information
- **Infinite Scrolling**: Load more data on scroll
- **Loading State**: Skeleton bars during data fetch
- **Dynamic Height**: Adjusts based on data count

#### Visual Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Value Distribution                                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Category A  ████████████████████████████  128              │
│  Category B  ██████████████████████  96                     │
│  Category C  ████████████████  64                           │
│  Category D  ██████████  40                                 │
│  Category E  ████  16                                       │
│                                                             │
│  ─────────────────────────────────────────────              │
│  0           50          100         150                    │
│                     Count                                   │
└─────────────────────────────────────────────────────────────┘
```

#### Usage Example

```jsx
import { BarChart } from "../components/visualization";

function ValueDistribution({ columnId }) {
  const { values, isLoading, loadMore } = useColumnValues(columnId);

  // Convert value counts to chart data
  const chartData = Object.fromEntries(values.map((v) => [v.value, v.count]));

  const tooltips = Object.fromEntries(
    values.map((v) => [v.value, `${v.percentage}% of total`])
  );

  return (
    <BarChart
      data={chartData}
      tooltipData={tooltips}
      title="Value Distribution"
      xAxisLabel="Count"
      color="#3b82f6"
      onScrollNearBottom={loadMore}
      isLoading={isLoading}
    />
  );
}
```

### ProportionBar

A horizontal stacked bar showing proportional distribution of categories.

#### Props

| Prop         | Type       | Required | Default        | Description                         |
| ------------ | ---------- | -------- | -------------- | ----------------------------------- |
| `title`      | `string`   | No       | —              | Bar title                           |
| `data`       | `object`   | Yes      | —              | Key-value pairs of labels to values |
| `colorScale` | `function` | No       | `() => '#ccc'` | D3 color scale function             |
| `barStyles`  | `object`   | No       | `{}`           | Custom styles per segment           |
| `height`     | `string`   | No       | `'20px'`       | Bar height                          |

#### Features

- **Stacked Segments**: Each category as proportional segment
- **Color Scale**: Automatic or custom coloring
- **Flexible Height**: Configurable bar height
- **Empty State**: Handles zero-total gracefully

#### Visual Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Type A (50%)        │ Type B (30%) │ Type C (20%)│         │
│  ████████████████████│██████████████│█████████████│         │
└─────────────────────────────────────────────────────────────┘
```

#### Usage Example

```jsx
import { ProportionBar } from "../components/visualization";
import * as d3 from "d3";

function MatchProportions({ stats }) {
  const data = {
    Matched: stats.matchCount,
    "Left Only": stats.leftOnlyCount,
    "Right Only": stats.rightOnlyCount,
  };

  const colorScale = d3
    .scaleOrdinal()
    .domain(["Matched", "Left Only", "Right Only"])
    .range(["#22c55e", "#3b82f6", "#f59e0b"]);

  return (
    <ProportionBar
      title="Match Distribution"
      data={data}
      colorScale={colorScale}
      height="24px"
    />
  );
}
```

## D3 Integration

Both components use D3 for calculations without D3 DOM manipulation:

```javascript
import * as d3 from "d3";

// Linear scale for bar widths
const xScale = d3
  .scaleLinear()
  .domain([0, d3.max(Object.values(data))])
  .range([0, chartWidth]);

// Band scale for bar positions
const yScale = d3
  .scaleBand()
  .domain(Object.keys(data))
  .range([0, chartHeight])
  .padding(0.1);

// Color scale for categories
const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
```

## Common Use Cases

### Column Value Distribution

```jsx
function ColumnStats({ column }) {
  if (column.type === "string") {
    return (
      <BarChart data={column.valueCounts} title="Top Values" color="#8b5cf6" />
    );
  }

  // Numeric columns get histogram
  return (
    <BarChart
      data={column.histogram}
      title="Distribution"
      formatValue={(v) => v.toFixed(2)}
    />
  );
}
```

### Match Statistics

```jsx
function PackMatchSummary({ matchStats }) {
  return (
    <ProportionBar
      data={{
        Matched: matchStats.matchCount,
        "Unmatched Left": matchStats.leftOnlyCount,
        "Unmatched Right": matchStats.rightOnlyCount,
      }}
      colorScale={d3
        .scaleOrdinal()
        .domain(["Matched", "Unmatched Left", "Unmatched Right"])
        .range(["#22c55e", "#ef4444", "#f59e0b"])}
    />
  );
}
```

### Loading State

```jsx
function LazyBarChart({ columnId }) {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchValueCounts(columnId)
      .then(setData)
      .finally(() => setLoading(false));
  }, [columnId]);

  return <BarChart data={data} isLoading={loading} />;
}
```

## Styling

### Custom Bar Colors

```jsx
// Single color for all bars
<BarChart data={data} color="#8b5cf6" />

// Color scale for proportion bar
<ProportionBar
  data={data}
  colorScale={d3.scaleOrdinal(d3.schemeTableau10)}
/>
```

### Custom Segment Styles

```jsx
<ProportionBar
  data={data}
  barStyles={{
    "Type A": { opacity: 0.8, borderRadius: "4px 0 0 4px" },
    "Type C": { opacity: 0.8, borderRadius: "0 4px 4px 0" },
  }}
/>
```

## Performance Considerations

1. **SVG Rendering**: Uses SVG for crisp rendering at any scale
2. **Virtualization Ready**: BarChart supports incremental loading
3. **Memoization**: Chart calculations memoized to prevent recalculation
4. **Lazy Rendering**: Only visible bars rendered during scroll

## Related Components

- **ColumnDetails** (`ColumnViews/`) - Uses BarChart for value distribution
- **MatchStatsVenn** (`PackOperationView/`) - Alternative match visualization
- **UnmatchedValuesBar** (`ColumnViews/`) - Uses ProportionBar for unmatched values

## Accessibility

- Bars include `role="img"` and `aria-label` for screen readers
- Tooltips accessible via keyboard focus
- Color contrast meets WCAG guidelines
- Labels provided for all data points
