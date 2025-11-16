# Columns Slice

This module contains JavaScript code related to columns in the global data state. It includes:

- `Column.js`: A serializable factory function for creating columns intended to be stored in Redux.
- `columnSlice.js`:
  - `byId`:
  - `allIds`: an array of all column IDs
- `selectors.js`: Memoized selectors for accessing data related to columns. This file of selectors includes selectors that return data related to columns, including selectors that work across multiple slices to return column Ids. Some of the more salient selectors include function to select columns that pretain to data-related partitions, e.g. excluded vs. active columns.

Columns have a _polymorphic association_ between other objects, they can belong to either a table or an operation, but not both.

## Input normalization

In some contexts, Roundup updates data state objects one at a time or multiple objects in a batch. In order to simplify our source code, we normalize the input of many reducers and selectors so that the codebase only passes a single string as an argument to return a single object or an array of objects to return an array of objects in return. This allows use to not write singular and plural versions of all reducers and selectors and is semantically more straightforward instead of passing just an array of one item in the singlteton context.
