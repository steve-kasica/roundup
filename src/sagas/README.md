### Creating tables

Trigger chain for `createTablesSaga`, this happens when a user uploads
a new file to Roundup/

1. `createTablesSaga` (puts `createTablesSuccess`)
   1. `createColumnsSaga` (puts `createColumnsSuccess`)
      1. `updateTablesSaga`
      2. `updateColumnsSaga`

\*`updateTablesSaga` behaves differently whether or it is called via a `createColumnSuccess` event or a `createTablesSuccess`. The latest only updates the `columnIds` property of the table, which provides the up-to-date mapping between tables and columns.
