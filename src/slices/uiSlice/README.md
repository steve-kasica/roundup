# UI Slice

This module manages all UI interaction state across the application. Unlike data slices (tables, columns, operations), the UI slice tracks ephemeral interaction states that don't persist between sessions.

## Purpose

The UI slice centralizes interaction state that needs to be coordinated across multiple components, such as:

- Which columns are selected, hovered, or being dragged
- Which table or operation is currently focused
- Which operations are loading
- Match type selections for PACK operations

## State Structure

```javascript
{
  hoveredColumnIds: [],      // Columns under cursor
  selectedColumnIds: [],     // User-selected columns
  focusedColumnIds: [],      // Keyboard-focused columns
  visibleColumnIds: [],      // Currently visible columns
  draggingColumnIds: [],     // Columns being dragged
  dropTargetColumnIds: [],   // Valid drop targets
  focusedObjectId: null,     // Active table or operation ID
  loadingOperations: [],     // Operations currently processing
  selectedMatches: []        // Match types for PACK highlighting
}
```

## Reducers

### Column Interactions

| Reducer                      | Description                   |
| ---------------------------- | ----------------------------- |
| `setSelectedColumnIds`       | Sets the selected column IDs  |
| `setHoveredColumnIds`        | Sets columns under cursor     |
| `addToHoveredColumnIds`      | Adds to hovered set           |
| `removeFromHoveredColumnIds` | Removes from hovered set      |
| `setFocusedColumnIds`        | Sets keyboard-focused columns |
| `setVisibleColumnIds`        | Sets visible column IDs       |
| `setDraggingColumnIds`       | Sets columns being dragged    |
| `setDropTargetColumnIds`     | Sets valid drop targets       |

### Object Focus

| Reducer              | Description                         |
| -------------------- | ----------------------------------- |
| `setFocusedObjectId` | Sets the focused table or operation |

### Loading State

| Reducer                       | Description                   |
| ----------------------------- | ----------------------------- |
| `addToLoadingOperations`      | Marks operation(s) as loading |
| `removeFromLoadingOperations` | Clears loading state          |

### Match Selection

| Reducer              | Description                            |
| -------------------- | -------------------------------------- |
| `setSelectedMatches` | Sets match types for PACK highlighting |

## Selectors

### Column State Selectors

| Selector                    | Description                     |
| --------------------------- | ------------------------------- |
| `selectSelectedColumnIds`   | Get all selected column IDs     |
| `selectHoveredColumnIds`    | Get hovered column IDs          |
| `selectDraggingColumnIds`   | Get dragging column IDs         |
| `selectFocusedColumnIds`    | Get keyboard-focused column IDs |
| `selectVisibleColumnIds`    | Get visible column IDs          |
| `selectDropTargetColumnIds` | Get drop target column IDs      |

### Filtered Selectors

| Selector                            | Description                            |
| ----------------------------------- | -------------------------------------- |
| `selectSelectedColumnIdsByParentId` | Selected columns for a specific parent |
| `selectHoveredColumnIdsByParentId`  | Hovered columns for a specific parent  |

### Object Selectors

| Selector                  | Description                    |
| ------------------------- | ------------------------------ |
| `selectFocusedObjectId`   | Get focused table/operation ID |
| `selectLoadingOperations` | Get loading operation IDs      |
| `selectSelectedMatches`   | Get selected match types       |

## Usage Patterns

### Multi-Select Columns

```javascript
dispatch(setSelectedColumnIds(["col_1", "col_2", "col_3"]));
```

### Track Drag State

```javascript
// On drag start
dispatch(setDraggingColumnIds(selectedColumnIds));
// On drag end
dispatch(setDraggingColumnIds([]));
```

### Loading Indicators

```javascript
// Start loading
dispatch(addToLoadingOperations(operationId));
// Complete loading
dispatch(removeFromLoadingOperations(operationId));
```

## Input Normalization

All reducers accept both single values and arrays. This allows consistent API usage whether operating on one or many items:

```javascript
// Both are valid:
dispatch(setSelectedColumnIds("col_1"));
dispatch(setSelectedColumnIds(["col_1", "col_2"]));
```
