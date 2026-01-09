# Sagas

## Structure of sagas

Each saga typically consists of three main files:

- `watcher.js`: Listens for specific Redux actions and triggers the corresponding worker saga.
- `worker.js`: Contains the logic to perform the side effects, such as database operations and state updates.
- `actions.js`: Defines Redux action creators used to initiate saga processes.

We also include a `README.md` file in each saga directory to document its purpose, actions, payload structures, downstream effects, and relationships with other sagas.

Our `watcher.js` files do more than just watch for actions; they also handle complex orchestration logic. This includes responding to actions from other sagas, managing cascading updates, and ensuring that related data objects remain consistent across the application state. This ensure that the `worker.js` files can focus solely on their core responsibilities of updating the database and state without being burdened by orchestration logic.

## Relationship between sagas

Sagas orchestrate complex workflows in Roundup, managing side effects, interacting with databases, and ensuring state consistency across Redux slices. They listen for specific actions and trigger worker sagas to perform three tasks: creation, update, deletion, on three different data objects: tables, columns, and operations such as updating tables, columns, and operations.

```mermaid
   stateDiagram

   alertsSaga:Alerts
   updateOps:Update operations
   updateTables:Update tables
   updateCols:Update columns
   createOps:Create operations
   createTables:Create tables
   createCols:Create columns
   deleteOps:Delete operations
   deleteTables:Delete tables
   deleteCols:Delete columns

   createCols --> createCols: Operation column creation triggers child table/operation column creation
   createTables --> createCols: Table is created
   updateOps --> createCols: Operation has been (re)materialized

   updateOps --> alertsSaga: If certain properties are modified
   createOps --> alertsSaga: Any new operation
   updateTables --> alertsSaga: Certain properties are modified

   deleteCols --> deleteCols: columns' parent is an operation
   updateOps --> deleteCols: update orphans columns
   deleteTables --> deleteCols: delete orphaned columns
   deleteOps --> deleteCols: delete orphaned columns

   updateOps --> deleteOps: Update creates a childless operation
   deleteOps --> deleteOps: If operation has operation children

   updateTables-->deleteTables: Deleting all columns
   deleteOps-->deleteTables: Delete any child tables

   createCols --> updateCols: Update newly created columns

   createOps --> updateOps: Sets defaults for new operations
   updateTables --> updateOps: Flags operations as out-of-sync
   updateOps --> updateOps: Handles cascading updates and rematerialization
```
