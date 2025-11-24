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

## Inserting a column into a child table (of an operation)

```mermaid
%%{init: {'theme': 'base'}}%%
graph TB
   subgraph o1["O<sub>1</sub>"]
      direction TB
      C5["C<sub>5</sub>"]
      C10["C<sub>10</sub>"]
      C6["C<sub>6</sub>"]
      C7["C<sub>7</sub>"]
      C8["C<sub>8</sub>"]
   end
   subgraph t1["T<sub>1</sub>"]
      direction TB
      C1["C<sub>1</sub>"]
      C9["C<sub>9</sub>"]
      C2["C<sub>2</sub>"]
   end
   subgraph t2["T<sub>2</sub>"]
      direction TB
      C3["C<sub>3</sub>"]
      C4["C<sub>4</sub>"]
   end
   o1 --- t1
   o1 --- t2
```

Inserting columns into an child operation

```mermaid
   graph TB
   O1 --->|1. Insert| O2
      O2 -->|4. Update| O1
   O1 --- T3
   O2 --->|2. Insert| T1
      T1 -->|3. Update| O2
   O2 --- T2

   linkStyle 0 stroke: red
   linkStyle 1 stroke: red
   linkStyle 3 stroke: red
   linkStyle 4 stroke: red
```

---
