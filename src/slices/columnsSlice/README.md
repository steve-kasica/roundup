# Columns Slice

This module contains JavaScript code related to columns in the global data state. It includes:

- `Column.js`: A serializable factory function for creating columns intended to be stored in Redux.
- `columnSlice.js`:
  - `byId`:
  - `allIds`: an array of all column IDs
- `selectors.js`: Memoized selectors for accessing data related to columns. This file of selectors includes selectors that return data related to columns, including selectors that work across multiple slices to return column Ids. Some of the more salient selectors include function to select columns that pretain to data-related partitions, e.g. excluded vs. active columns.

Columns have a _polymorphic association_ between other objects, they can belong to either a table or an operation, but not both.
