## Schema window

- In term of depth it only displays child tables and child columns
- Provides a toolbar for performing operations on multiple columns at once
- Each column can provide a context menu
  - Signified view the cursor icon on hover
- The schema window provides a high-level overview of the table/operation in focus.
- It partitions in two dimensions:
  - Horizontally: by column
  - Vertically: in both operations
    - Stack operation: by source table
    - Pack operation: by row match type (matches, left only, right onlys)

## Row window

- The Row window coordinates with the Schema window, it implements an overview-first-details-on-demand technique allow the user to subset portion of the schema according to corresponding vertical and horizontal dimension and provide more details in those dimensions (it goes deep enough to provide values)
