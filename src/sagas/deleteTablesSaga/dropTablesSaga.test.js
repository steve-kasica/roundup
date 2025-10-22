// import { describe, it, expect, beforeEach } from "vitest";
// import { runSaga } from "redux-saga";
// import { dropTablesSagaWorker, dropTablesAction } from "./worker";
// import {
//   addTablesToLoading,
//   dropTables,
//   removeTablesFromLoading,
//   Table,
// } from "../../slices/tablesSlice";
// import {
//   Column,
//   COLUMN_TYPE_CATEGORICAL,
//   deleteColumns,
// } from "../../slices/columnsSlice";
// import { removeFromSelectedTables } from "../../slices/uiSlice/uiSlice";
// import { removeChildFromOperation } from "../../slices/operationsSlice/operationsSlice";
// import { vi } from "vitest";
// import { mock } from "node:test";
// import Operation, {
//   OPERATION_TYPE_STACK,
// } from "../../slices/operationsSlice/Operation";

// // Mock the DuckDB dropTable function to prevent Worker errors in tests
// vi.mock("../../lib/duckdb", () => ({
//   dropTable: vi.fn(),
// }));

// describe("dropTablesSagaWorker", () => {
//   let dispatched;

//   beforeEach(() => {
//     dispatched = [];
//   });

//   describe("Tables not included in an operation", () => {
//     it("dispatches correct actions", async () => {
//       const table = Table("foo", "table", "csv", 1024, "text/csv", 4, 20);
//       const columns = Array.from({ length: 4 }, (_, i) =>
//         Column(table.id, i, `column-${i}`, COLUMN_TYPE_CATEGORICAL)
//       );
//       table.columnIds = columns.map((c) => c.id);
//       const mockState = {
//         tables: {
//           data: {
//             [table.id]: table,
//           },
//         },
//         operations: {
//           data: {},
//         },
//       };
//       await runSaga(
//         {
//           dispatch: (action) => dispatched.push(action),
//           getState: () => mockState,
//         },
//         dropTablesSagaWorker,
//         { payload: table.id }
//       ).toPromise();

//       expect(dispatched).toEqual([
//         addTablesToLoading([table.id]),
//         deleteColumns(table.columnIds),
//         dropTables([table.id]),
//         // Ommit DuckDB b/c it's not an action
//       ]);
//     });
//   });

//   describe("Tables included in an operation", () => {
//     it("dispatches correct actions", async () => {
//       const table = Table("foo", "table", "csv", 1024, "text/csv", 4, 20);
//       const columns = Array.from({ length: 4 }, (_, i) =>
//         Column(table.id, i, `column-${i}`, COLUMN_TYPE_CATEGORICAL)
//       );
//       table.columnIds = columns.map((c) => c.id);
//       const operation = Operation(OPERATION_TYPE_STACK, [table.id]);
//       table.operationId = operation.id;
//       const mockState = {
//         tables: {
//           data: {
//             [table.id]: table,
//           },
//         },
//         operations: {
//           data: {
//             [operation.id]: operation,
//           },
//         },
//       };
//       await runSaga(
//         {
//           dispatch: (action) => dispatched.push(action),
//           getState: () => mockState,
//         },
//         dropTablesSagaWorker,
//         { payload: table.id }
//       ).toPromise();

//       expect(dispatched).toEqual([
//         addTablesToLoading([table.id]),
//         removeChildFromOperation({
//           operationId: table.operationId,
//           childId: table.id,
//         }),
//         deleteColumns(table.columnIds),
//         dropTables([table.id]),
//         // Ommit DuckDB b/c it's not an action
//       ]);
//     });
//   });

//   // it("dispatches correct actions for multiple table ids", async () => {
//   //   const tableIds = ["table1", "table2"];
//   //   const mockState = {
//   //     tables: {
//   //       data: {
//   //         table1: { id: "table1", operationId: undefined },
//   //         table2: { id: "table2", operationId: undefined },
//   //       },
//   //     },
//   //     // add other slices if needed by selectors
//   //   };
//   //   await runSaga(
//   //     {
//   //       dispatch: (action) => dispatched.push(action),
//   //       getState: () => mockState,
//   //     },
//   //     dropTablesSagaWorker,
//   //     { payload: tableIds }
//   //   ).toPromise();

//   //   expect(dispatched).toEqual([
//   //     addTablesToLoading(tableIds),
//   //     removeChildFromOperation({ operationId: undefined, childId: "table1" }),
//   //     removeChildFromOperation({ operationId: undefined, childId: "table2" }),
//   //     removeTables(tableIds),
//   //     removeFromSelectedTables("table1"),
//   //     removeFromSelectedTables("table2"),
//   //     removeTablesFromLoading(tableIds),
//   //   ]);
//   // });
// });
