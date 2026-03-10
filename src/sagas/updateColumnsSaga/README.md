# Update Columns saga

The update columns saga is responsible for handling the updating of column properties in response to various actions within the application. It listens for specific actions and triggers the appropriate worker saga to perform the updates.

This saga also handles precomputing column metadata, such as summary statistics and top values, which are derived from database queries. This precomputation allows for faster access to this information when needed for analysis and visualization.

This saga updates column metadata in state by mutating the object inplace, rather than replacing it entirely. This approach helps to preserve references to the column object held elsewhere in the state tree. We know inplace mutation is safe here because Redux Toolkit uses Immer under the hood, which tracks changes and produces a new immutable state.

## Relationship to other sagas

```mermaid
stateDiagram
    updateCols:Update columns saga
    createCols:Create columns saga

    createCols --> updateCols: Update newly created columns
```
