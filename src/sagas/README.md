### Creating tables

Trigger chain for `createTablesSaga`, this happens when a user uploads
a new file to Roundup/

\*`updateTablesSaga` behaves differently whether or it is called via a `createColumnSuccess` event or a `createTablesSuccess`. The latest only updates the `columnIds` property of the table, which provides the up-to-date mapping between tables and columns.

Sagas also address the added complexity of denormalizing the Redux state, coordinating updates across slices. Roundup frequently needs to inverse lookup, e.g. get all columns from this table. So that these computations are $O(1)$ and not $O(n)$ where $n$ equals the number of columns across all tables and operations. We denormalize the state and derive indexes. Sagas are where we implement logic to maintain consistency across slices since inverse lookups are performance-critical. Thus we pay an additional cost at write-time (more complex updates), but reap the benefits at read time. Thus, while Sagas have other purposes, they also serve as middleware for maintaining consistency across slices.

# Control flows

## Uploading a source table

When the user uploads a source table from their personal computer. The following happens in the Sagas layer

```mermaid
flowchart LR
   Start -->|request| B[[Create<br>tables<br>saga]]
      B -->|success| E[[Create<br>columns<br>saga]]
         E -->|success| H[[Update<br>columns<br>saga]]
               H -->|success| Z
               H -->|failure| Z
         E -->|failure| Z
      B -->|failure| Z[[handleAlerts]]
   Z --> End
```

## Creating an operation

```mermaid
flowchart LR
   A(Create<br>operations<br>request) --> B[[Create<br>operations<br>saga]]
      B --> C(Create<br>operations<br>success)
         C --> E[[Update<br>operations<br>saga]]
            E --> F(Update<br>operations<br>success)
               F --> Z[[handleAlerts]]
            E --> G(Update<br>operations<br>failure)
               G --> Z[[handleAlerts]]
         C --> Z
      B --> D(Create<br>operations<br>failure)
         D --> Z[[handleAlerts]]

```

## Inserting a column into an operation

---
