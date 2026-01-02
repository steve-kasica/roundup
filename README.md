# Open Roundup

Open Roundup is a web-based data wrangling tool that enables users to combine tabular data through visual operations. The system leverages **DuckDB-WASM** for client-side SQL execution, **Redux Saga** for complex async workflows, and **React** with **Material-UI** for the user interface. It provides the following key features:

- **Client-Side SQL Execution**: Using DuckDB-WASM for privacy-preserving data wrangling
- **Visual Operation Tree**: Novel visualization of data lineage and transformations
- **Schema-First Approach**: Column-level focus before row-level inspection
- **Real-Time Validation**: Proactive error detection during schema construction

It includes:

- Clean separation of concerns (UI/State/Effects/Database)
- Modern React patterns (HOCs, hooks, context)

## 1. System Architecture Overview

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         React UI Layer                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │
│  │   Layouts   │  │ Components  │  │    HOCs     │  │   Hooks    │ │
│  │ (Panels)    │  │ (Table/Col) │  │ (Data Inj.) │  │ (Data Fx)  │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘ │
└───────────────────────────┬─────────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────────┐
│                      Redux State Layer                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │
│  │   uiSlice   │  │ tablesSlice │  │columnsSlice │  │ operations │ │
│  │             │  │             │  │             │  │   Slice    │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘ │
│                         ┌─────────────┐                             │
│                         │ alertsSlice │                             │
│                         └─────────────┘                             │
└───────────────────────────┬─────────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────────┐
│                     Redux Saga Layer                                │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │                    rootSaga                                    │ │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌──────────┐ │ │
│  │  │ create* │ │ update* │ │ delete* │ │ alerts  │ │materialize│ │ │
│  │  │  Sagas  │ │  Sagas  │ │  Sagas  │ │  Saga   │ │   Saga   │ │ │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └──────────┘ │ │
│  └───────────────────────────────────────────────────────────────┘ │
└───────────────────────────┬─────────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────────┐
│                    DuckDB-WASM Layer                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │
│  │   Tables    │  │   Views     │  │   Queries   │  │    Stats   │ │
│  │  (CSV/File) │  │ (STACK/PACK)│  │  (SQL Gen)  │  │  (Agg Fx)  │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

#### 1.2.1 Data Model

The system represents data transformations as a **tree of operations** where:

- **Tables** (`t_*`): Leaf nodes representing imported CSV files
- **Operations** (`o_*`): Internal nodes representing transformations
- **Columns** (`c_*`): Attributes belonging to tables or operations

**Operation Types:**

1. **STACK** (Union): Vertically combines rows from multiple tables
2. **PACK** (Join): Horizontally combines columns via key-based joins
3. **NO_OP**: Single table passthrough (identity operation)

#### 1.2.2 State Normalization Pattern

All domain entities use a **normalized `byId/allIds` pattern**:

```javascript
{
  allIds: ['t1', 't2', 't3'],  // Ordered array for iteration
  byId: {                      // O(1) lookup by ID
    't1': { id: 't1', name: 'Sales', columnIds: ['c1', 'c2'] },
    't2': { id: 't2', name: 'Products', columnIds: ['c3', 'c4'] },
  }
}
```

This pattern enables:

- O(1) entity lookups
- O(n) ordered iteration
- Efficient partial updates
- Denormalized cross-slice references (e.g., `table.columnIds`)

#### 1.2.3 Saga-Based Side Effect Management

The system uses **Redux Saga** for managing complex async workflows. Each domain entity has a corresponding saga module:

```
sagas/
├── createTablesSaga/    # File upload → DuckDB table creation
├── createColumnsSaga/   # Column metadata extraction
├── createOperationsSaga/# Operation tree construction
├── updateTablesSaga/    # Table property synchronization
├── updateColumnsSaga/   # Column statistics refresh
├── updateOperationsSaga/# Operation parameter changes
├── deleteTablesSaga/    # Cascading table deletion
├── deleteColumnsSaga/   # Column removal from schema
├── deleteOperationsSaga/# Operation tree pruning
├── alertsSaga/          # Validation error management
└── materializeOperationSaga/  # DuckDB view creation
```

#### 2.1.1 Factory Functions for Serializable State

The use of factory functions (e.g., `Table()`, `Column()`, `Operation()`, `Alert()`) ensures:

- Redux-serializable state (no class instances)
- Consistent default values
- Clear documentation of entity shape
- Easy testing and mocking

```javascript
// Example from Operation.js
function Operation({
  operationType = null,
  childIds = [],
  columnIds = [],
  joinType = JOIN_TYPES.FULL_OUTER,
  // ...
} = {}) {
  const id = `o${++idCounter}`;
  return { id, operationType, childIds, columnIds, joinType /* ... */ };
}
```

#### 2.1.2 Higher-Order Components for Data Injection

The HOC pattern (`withOperationData`, `withColumnData`, `withTableData`) effectively separates:

- **Data fetching/derivation** (HOC layer)
- **Presentation** (wrapped component)

This enables:

- Component reuse with different data sources
- Drag preview rendering without Redux connection
- Easier unit testing of presentational components

```javascript
// Usage pattern
export const EnhancedColumnSummary = withAssociatedAlerts(
  withColumnData(ColumnSummary)
);
```

#### 2.1.3 Comprehensive Test Coverage

The project has excellent test coverage for:

- Redux slice reducers (100% coverage)
- Redux selectors (100% coverage)
- Saga watchers and workers (comprehensive)

**Statistics:**

- ~9,400 lines of test code
- ~32,500 lines of source code
- ~29% test-to-source ratio

#### 2.1.4 Memoized Selectors

Consistent use of `createSelector` from Redux Toolkit for derived state:

```javascript
export const selectOperationQueryData = createSelector(
  [selectOperationsById, selectColumnsById, selectTableQueryData],
  (operation, columns, tableData) => {
    /* derived computation */
  }
);
```

### 2.2 Documentation Quality

The codebase features **excellent JSDoc documentation** with:

- File-level `@fileoverview` descriptions
- `@module` tags for import documentation
- `@example` usage patterns
- Comprehensive `@param` and `@returns` annotations

---

## Code Metrics Summary

| Metric                     | Value              |
| -------------------------- | ------------------ |
| Total Source Lines         | ~32,500            |
| Total Test Lines           | ~9,400             |
| Test Coverage Ratio        | 29%                |
| Number of React Components | ~60                |
| Number of Redux Slices     | 5                  |
| Number of Saga Modules     | 11                 |
| Number of DuckDB Utilities | 25+                |
| Average File Size          | ~150 lines         |
| Dependencies               | 35 runtime, 17 dev |
