# Create Tables Saga

The create tables saga is responsible for handling the creation of table metadata objects, defined in `Tables.js`, and tables in the local database.

# Relationships with other Sagas

```mermaid
---
title: Create Tables Saga
---
  stateDiagram
    direction LR
    createTables:Create tables saga
    createColumns:Create columns saga

    createTables --> createColumns: create columns after table creation
    createTables --> uiSaga: set focused object to newest table
 -->
```
