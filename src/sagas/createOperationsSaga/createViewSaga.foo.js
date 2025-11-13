// import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
// import { runSaga } from "redux-saga";

// import {
//   createOperationViewSagaWorker,
//   createOperationViewSuccess,
//   selectQueryData,
// } from "./createOperationViewSaga";

// import {
//   OPERATION_TYPE_NO_OP,
//   OPERATION_TYPE_PACK,
//   OPERATION_TYPE_STACK,
//   updateOperations,
// } from "../../slices/operationsSlice";

// import {
//   addColumns,
//   Column,
//   COLUMN_TYPE_CATEGORICAL,
// } from "../../slices/columnsSlice";

// import {
//   getTableDimensions,
//   createStackView,
//   createPackView,
// } from "../../lib/duckdb";

// // Mock the Column constructor
// vi.mock("../../slices/columnsSlice", async () => {
//   const actual = await vi.importActual("../../slices/columnsSlice");
//   return {
//     ...actual,
//     Column: vi.fn(),
//   };
// });

// // Mock DuckDB functions
// vi.mock("../../lib/duckdb", () => ({
//   getTableDimensions: vi.fn(),
//   createStackView: vi.fn(),
//   createPackView: vi.fn(),
//   getColumnNames: vi.fn(),
// }));

// describe("createOperationViewSaga", () => {
//   let dispatched;

//   beforeEach(() => {
//     dispatched = [];
//     vi.clearAllMocks();

//     // Setup default Column mock
//     vi.mocked(Column).mockImplementation(
//       (operationId, index, name, type, sourceIds = []) => ({
//         id: `new-col-${index + 1}`,
//         name,
//         columnType: type,
//         sourceIds,
//       })
//     );
//   });

//   afterEach(() => {
//     vi.restoreAllMocks();
//   });

//   describe("createOperationViewSagaWorker", () => {
//     const mockState = {
//       operations: {
//         data: {
//           "op-1": {
//             id: "op-1",
//             operationType: OPERATION_TYPE_STACK,
//             childIds: ["table-1"],
//           },
//         },
//         ids: ["op-1"],
//         root: "op-1",
//         focused: null,
//         hovered: null,
//       },
//       columns: {
//         data: {
//           "col-1": {
//             id: "col-1",
//             name: "col1",
//             columnType: COLUMN_TYPE_CATEGORICAL,
//           },
//           "col-2": {
//             id: "col-2",
//             name: "col2",
//             columnType: COLUMN_TYPE_CATEGORICAL,
//           },
//         },
//         ids: ["col-1", "col-2"],
//         idsByTable: {
//           "table-1": ["col-1", "col-2"],
//         },
//       },
//     };

//     it("should handle NO_OP operations", async () => {
//       const noOpState = {
//         ...mockState,
//         operations: {
//           ...mockState.operations,
//           data: {
//             "op-1": {
//               id: "op-1",
//               operationType: OPERATION_TYPE_NO_OP,
//               childIds: [],
//             },
//           },
//         },
//       };

//       await runSaga(
//         {
//           dispatch: (action) => dispatched.push(action),
//           getState: () => noOpState,
//         },
//         createOperationViewSagaWorker,
//         { payload: "op-1" }
//       ).toPromise();

//       // Should not dispatch any actions for NO_OP
//       expect(dispatched).toHaveLength(0);
//     });

//     it("should handle STACK operation successfully", async () => {
//       // Mock successful database operations
//       vi.mocked(createStackView).mockResolvedValue(null);
//       vi.mocked(getTableDimensions).mockResolvedValue({
//         rowCount: 100,
//         columnCount: 2,
//       });

//       await runSaga(
//         {
//           dispatch: (action) => dispatched.push(action),
//           getState: () => mockState,
//         },
//         createOperationViewSagaWorker,
//         { payload: "op-1" }
//       ).toPromise();

//       // Check that the correct actions were dispatched
//       const actionTypes = dispatched.map((action) => action.type);
//       expect(actionTypes).toContain(addColumns.type);
//       expect(actionTypes).toContain(updateOperations.type);
//       expect(actionTypes).toContain(createOperationViewSuccess.type);

//       // Verify addColumns was called with correct structure
//       const addColumnsAction = dispatched.find(
//         (action) => action.type === addColumns.type
//       );
//       expect(addColumnsAction.payload).toHaveLength(2); // Two columns from table-1

//       // Verify row count update
//       const updateAction = dispatched.find(
//         (action) =>
//           action.type === updateOperations.type && action.payload.rowCount
//       );
//       expect(updateAction.payload.rowCount).toBe(100);

//       // Verify success action
//       const successAction = dispatched.find(
//         (action) => action.type === createOperationViewSuccess.type
//       );
//       expect(successAction.payload.operationId).toBe("op-1");
//       expect(successAction.payload.operationType).toBe(OPERATION_TYPE_STACK);
//     });

//     it("should handle PACK operation successfully", async () => {
//       const packState = {
//         ...mockState,
//         operations: {
//           ...mockState.operations,
//           data: {
//             "op-1": {
//               id: "op-1",
//               operationType: OPERATION_TYPE_PACK,
//               childIds: ["table-1", "table-2"],
//             },
//           },
//         },
//         columns: {
//           ...mockState.columns,
//           data: {
//             "col-1": {
//               id: "col-1",
//               name: "col1",
//               columnType: COLUMN_TYPE_CATEGORICAL,
//             },
//             "col-2": {
//               id: "col-2",
//               name: "col2",
//               columnType: COLUMN_TYPE_CATEGORICAL,
//             },
//             "col-3": {
//               id: "col-3",
//               name: "col3",
//               columnType: COLUMN_TYPE_CATEGORICAL,
//             },
//           },
//           ids: ["col-1", "col-2", "col-3"],
//           idsByTable: {
//             "table-1": ["col-1", "col-2"],
//             "table-2": ["col-3"],
//           },
//         },
//       };

//       // Mock successful database operations
//       vi.mocked(createPackView).mockResolvedValue(null);
//       vi.mocked(getTableDimensions).mockResolvedValue({
//         rowCount: 150,
//         columnCount: 3,
//       });

//       await runSaga(
//         {
//           dispatch: (action) => dispatched.push(action),
//           getState: () => packState,
//         },
//         createOperationViewSagaWorker,
//         { payload: "op-1" }
//       ).toPromise();

//       // Check that the correct actions were dispatched
//       const actionTypes = dispatched.map((action) => action.type);
//       expect(actionTypes).toContain(addColumns.type);
//       expect(actionTypes).toContain(updateOperations.type);
//       expect(actionTypes).toContain(createOperationViewSuccess.type);

//       // Verify addColumns was called with all columns (flattened)
//       const addColumnsAction = dispatched.find(
//         (action) => action.type === addColumns.type
//       );
//       expect(addColumnsAction.payload).toHaveLength(3); // Three columns total

//       // Verify success action
//       const successAction = dispatched.find(
//         (action) => action.type === createOperationViewSuccess.type
//       );
//       expect(successAction.payload.operationType).toBe(OPERATION_TYPE_PACK);
//     });

//     it("should handle dimension validation errors", async () => {
//       // Mock database operations with invalid dimensions
//       vi.mocked(createStackView).mockResolvedValue(null);
//       vi.mocked(getTableDimensions).mockResolvedValue({
//         rowCount: 0,
//         columnCount: 2,
//       });

//       await runSaga(
//         {
//           dispatch: (action) => dispatched.push(action),
//           getState: () => mockState,
//         },
//         createOperationViewSagaWorker,
//         { payload: "op-1" }
//       ).toPromise();

//       // Should dispatch error action
//       const errorAction = dispatched.find(
//         (action) =>
//           action.type === updateOperations.type && action.payload.error
//       );
//       expect(errorAction).toBeDefined();
//       expect(errorAction.payload.error).toContain("Operation op-1 has no rows");

//       // Should not dispatch success action
//       const successAction = dispatched.find(
//         (action) => action.type === createOperationViewSuccess.type
//       );
//       expect(successAction).toBeUndefined();
//     });

//     it("should handle database errors", async () => {
//       // Mock database error
//       const dbError = new Error("Database connection failed");
//       vi.mocked(createStackView).mockRejectedValue(dbError);

//       await runSaga(
//         {
//           dispatch: (action) => dispatched.push(action),
//           getState: () => mockState,
//         },
//         createOperationViewSagaWorker,
//         { payload: "op-1" }
//       ).toPromise();

//       // Should dispatch error action
//       const errorAction = dispatched.find(
//         (action) =>
//           action.type === updateOperations.type && action.payload.error
//       );
//       expect(errorAction).toBeDefined();
//       expect(errorAction.payload.error).toContain("Database connection failed");

//       // Should not dispatch success action
//       const successAction = dispatched.find(
//         (action) => action.type === createOperationViewSuccess.type
//       );
//       expect(successAction).toBeUndefined();
//     });

//     it("should clear previous errors on successful operation", async () => {
//       const stateWithError = {
//         ...mockState,
//         operations: {
//           ...mockState.operations,
//           data: {
//             "op-1": {
//               id: "op-1",
//               operationType: OPERATION_TYPE_STACK,
//               childIds: ["table-1"],
//               error: "Previous error message",
//             },
//           },
//         },
//       };

//       // Mock successful database operations
//       vi.mocked(createStackView).mockResolvedValue(null);
//       vi.mocked(getTableDimensions).mockResolvedValue({
//         rowCount: 100,
//         columnCount: 2,
//       });

//       await runSaga(
//         {
//           dispatch: (action) => dispatched.push(action),
//           getState: () => stateWithError,
//         },
//         createOperationViewSagaWorker,
//         { payload: "op-1" }
//       ).toPromise();

//       // Should dispatch action to clear error
//       const clearErrorAction = dispatched.find(
//         (action) =>
//           action.type === updateOperations.type && action.payload.error === null
//       );
//       expect(clearErrorAction).toBeDefined();

//       // Should also dispatch success action
//       const successAction = dispatched.find(
//         (action) => action.type === createOperationViewSuccess.type
//       );
//       expect(successAction).toBeDefined();
//     });

//     it("should handle operations with empty children", async () => {
//       const emptyState = {
//         ...mockState,
//         operations: {
//           ...mockState.operations,
//           data: {
//             "op-1": {
//               id: "op-1",
//               operationType: OPERATION_TYPE_STACK,
//               childIds: [],
//             },
//           },
//         },
//       };

//       // Mock database operations that will fail due to no data
//       vi.mocked(createStackView).mockResolvedValue(null);
//       vi.mocked(getTableDimensions).mockResolvedValue({
//         rowCount: 0,
//         columnCount: 0,
//       });

//       await runSaga(
//         {
//           dispatch: (action) => dispatched.push(action),
//           getState: () => emptyState,
//         },
//         createOperationViewSagaWorker,
//         { payload: "op-1" }
//       ).toPromise();

//       // Should dispatch validation error due to empty children
//       const errorAction = dispatched.find(
//         (action) =>
//           action.type === updateOperations.type && action.payload.error
//       );
//       expect(errorAction).toBeDefined();
//       expect(errorAction.payload.error).toContain(
//         "Cannot read properties of undefined"
//       );

//       // Should not dispatch success action
//       const successAction = dispatched.find(
//         (action) => action.type === createOperationViewSuccess.type
//       );
//       expect(successAction).toBeUndefined();
//     });
//   });

//   describe("selectQueryData", () => {
//     it("should build query data correctly", () => {
//       const state = {
//         operations: {
//           data: {
//             "op-1": {
//               id: "op-1",
//               operationType: OPERATION_TYPE_STACK,
//               childIds: ["table-1", "table-2"],
//             },
//           },
//         },
//         columns: {
//           idsByTable: {
//             "table-1": ["col-1", "col-2"],
//             "table-2": ["col-3", "col-4"],
//           },
//         },
//       };

//       const result = selectQueryData(state, "op-1");

//       expect(result).toEqual({
//         id: "op-1",
//         operationType: OPERATION_TYPE_STACK,
//         childIds: [
//           { id: "table-1", columnIds: ["col-1", "col-2"] },
//           { id: "table-2", columnIds: ["col-3", "col-4"] },
//         ],
//       });
//     });

//     it("should handle missing column data", () => {
//       const state = {
//         operations: {
//           data: {
//             "op-1": {
//               id: "op-1",
//               operationType: OPERATION_TYPE_STACK,
//               childIds: ["table-1"],
//             },
//           },
//         },
//         columns: {
//           idsByTable: {},
//         },
//       };

//       const result = selectQueryData(state, "op-1");

//       expect(result).toEqual({
//         id: "op-1",
//         operationType: OPERATION_TYPE_STACK,
//         childIds: [{ id: "table-1", columnIds: undefined }],
//       });
//     });
//   });

//   describe("Database Integration", () => {
//     it("should call createStackView with correct parameters", async () => {
//       const mockCreateStackView = vi.mocked(createStackView);
//       mockCreateStackView.mockResolvedValue(null);
//       vi.mocked(getTableDimensions).mockResolvedValue({
//         rowCount: 100,
//         columnCount: 2,
//       });

//       await runSaga(
//         {
//           dispatch: (action) => dispatched.push(action),
//           getState: () => ({
//             operations: {
//               data: {
//                 "op-1": {
//                   id: "op-1",
//                   operationType: OPERATION_TYPE_STACK,
//                   childIds: ["table-1"],
//                 },
//               },
//               ids: ["op-1"],
//               root: "op-1",
//               focused: null,
//               hovered: null,
//             },
//             columns: {
//               data: {
//                 "col-1": {
//                   id: "col-1",
//                   name: "col1",
//                   columnType: COLUMN_TYPE_CATEGORICAL,
//                 },
//               },
//               ids: ["col-1"],
//               idsByTable: {
//                 "table-1": ["col-1"],
//               },
//             },
//           }),
//         },
//         createOperationViewSagaWorker,
//         { payload: "op-1" }
//       ).toPromise();

//       // Verify createStackView was called
//       expect(mockCreateStackView).toHaveBeenCalledTimes(1);

//       // Verify it was called with query data and column IDs
//       const [queryData, columnIds] = mockCreateStackView.mock.calls[0];
//       expect(queryData.id).toBe("op-1");
//       expect(queryData.operationType).toBe(OPERATION_TYPE_STACK);
//       expect(columnIds).toEqual(["new-col-1"]);
//     });

//     it("should call createPackView with correct parameters", async () => {
//       const mockCreatePackView = vi.mocked(createPackView);
//       mockCreatePackView.mockResolvedValue(null);
//       vi.mocked(getTableDimensions).mockResolvedValue({
//         rowCount: 100,
//         columnCount: 2,
//       });

//       await runSaga(
//         {
//           dispatch: (action) => dispatched.push(action),
//           getState: () => ({
//             operations: {
//               data: {
//                 "op-1": {
//                   id: "op-1",
//                   operationType: OPERATION_TYPE_PACK,
//                   childIds: ["table-1", "table-2"],
//                 },
//               },
//               ids: ["op-1"],
//               root: "op-1",
//               focused: null,
//               hovered: null,
//             },
//             columns: {
//               data: {
//                 "col-1": {
//                   id: "col-1",
//                   name: "col1",
//                   columnType: COLUMN_TYPE_CATEGORICAL,
//                 },
//                 "col-2": {
//                   id: "col-2",
//                   name: "col2",
//                   columnType: COLUMN_TYPE_CATEGORICAL,
//                 },
//               },
//               ids: ["col-1", "col-2"],
//               idsByTable: {
//                 "table-1": ["col-1"],
//                 "table-2": ["col-2"],
//               },
//             },
//           }),
//         },
//         createOperationViewSagaWorker,
//         { payload: "op-1" }
//       ).toPromise();

//       // Verify createPackView was called
//       expect(mockCreatePackView).toHaveBeenCalledTimes(1);

//       // Verify it was called with query data and column IDs
//       const [queryData, columnIds] = mockCreatePackView.mock.calls[0];
//       expect(queryData.id).toBe("op-1");
//       expect(queryData.operationType).toBe(OPERATION_TYPE_PACK);
//       expect(columnIds).toEqual(["new-col-1", "new-col-2"]);
//     });
//   });
// });
