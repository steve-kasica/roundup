# Composite Table Schema

This module renders an interactive nested treemap visualization of the complete operation tree using a novel layout algorithm. It communicates to the user how tables are combined through operations. It includes error handling, and drag-and-drop interactivity for adding additional source tables to the composite schema.

### Key Features

1. **Visual Hierarchy**: Nested blocks show operation structure
2. **Error Handling**: Data objects rendered in the composite schema include visual indicators showing error state, if any.
3. **Drop Targets**: Uses can add tables and create new operations via drag-and-drop interactions with the `TablesList` component.

## Layout algorithm

The treemap layout uses a simple recursive algorithm:

1. **Root Level**: Full available width
2. **STACK Children**: Divide height equally among children
3. **PACK Children**: Divide width equally among children
4. **Nested Operations**: Recursively apply same rules

## Directory Structure

- `ColumnTick.jsx`: A visual representation of column objects
- `CompositeTableSchema.jsx`: Main schema visualization
- `index.js`: Public exports
- `OperationBlock.jsx`: Main routing component for operations
- `PackOperationBlock.jsx`: A visual representation of pack operation objects
- `README.md`: This file
- `StackOperationBlock.jsx`: A visual representation of stack operation objects
- `TableBlock.jsx`: A visual representation for table objects
- `TableDropTarget.jsx`: Drop zone for adding tables

## Visual Representation

The component renders a nested treemap layout showing the operation hierarchy:

```
┌─────────────────────────────────────────────────────────────┐
│                     ROOT OPERATION                          │
│  ┌─────────────────────────────────────────────────────────┤
│  │                    STACK                                 │
│  │  ┌──────────────────┐ ┌──────────────────┐              │
│  │  │    Table A       │ │    Table B       │              │
│  │  │                  │ │                  │              │
│  │  └──────────────────┘ └──────────────────┘              │
│  └─────────────────────────────────────────────────────────┤
│                           ↕                                 │
│  ┌─────────────────────────────────────────────────────────┤
│  │                    PACK                                  │
│  │  ┌──────────────────┐ ┌──────────────────┐              │
│  │  │    Table C       │ │    Table D       │              │
│  │  └──────────────────┘ └──────────────────┘              │
│  └─────────────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────────────┘
```

### STACK (Union)

```
┌─────────────────────────────────────┐
│           STACK OPERATION           │
│ ┌───────────────┐ ┌───────────────┐ │
│ │   Table A     │ │   Table B     │ │
│ └───────────────┘ └───────────────┘ │
│      [+ Add table to stack]         │
└─────────────────────────────────────┘
```

- Tables stacked vertically (like SQL UNION)
- Columns aligned by index within their parent tables/operations

### PACK (Join)

```
┌─────────────────────────────────────┐
│           PACK OPERATION            │
│ ┌───────────────┐ ┌───────────────┐ │
│ │   Table A     │↔│   Table B     │ │
│ └───────────────┘ └───────────────┘ │
│      [+ Pack another table]         │
└─────────────────────────────────────┘
```

- Tables joined horizontally (like SQL JOIN)
- Key columns matched for joining
- Drop zone for additional tables
