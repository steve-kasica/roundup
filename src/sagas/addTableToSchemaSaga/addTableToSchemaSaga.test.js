import { describe, it, expect, vi } from "vitest";
import { runSaga } from "redux-saga";
import * as operationsSlice from "../../slices/operationsSlice";
import * as tablesSlice from "../../slices/tablesSlice";
import { addTableToSchemaSagaWorker } from "./addTableToSchemaSaga";

const tableId = "table-1";
const operationType = "JOIN";
const rootOperationId = "op-root";
const newOperationId = "op-new";

// Mock the default import for Operation
vi.mock("../../slices/operationsSlice/Operation", () => ({
  default: (type, children) => ({
    id: newOperationId,
    operationType: type,
    children,
  }),
}));

// Helper to run the saga and collect dispatched actions
async function recordSaga(saga, initialAction, state = {}) {
  const dispatched = [];
  await runSaga(
    {
      dispatch: (action) => dispatched.push(action),
      getState: () => state,
    },
    saga,
    initialAction
  ).toPromise();
  return dispatched;
}

describe("addTableToSchemaSagaWorker", () => {
  it("should initialize when no root operation", async () => {
    vi.spyOn(operationsSlice, "selectRootOperation").mockReturnValue(undefined);
    const addOperation = vi
      .spyOn(operationsSlice, "addOperation")
      .mockImplementation((op) => ({ type: "addOperation", payload: op }));
    const setTablesAttribute = vi
      .spyOn(tablesSlice, "setTablesAttribute")
      .mockImplementation((payload) => ({
        type: "setTablesAttribute",
        payload,
      }));

    const dispatched = await recordSaga(
      addTableToSchemaSagaWorker,
      { payload: { tableId, operationType } },
      {}
    );

    expect(addOperation).toHaveBeenCalled();
    expect(setTablesAttribute).toHaveBeenCalledWith({
      ids: tableId,
      attribute: "operationId",
      value: newOperationId,
    });
    expect(dispatched.some((a) => a.type === "addOperation")).toBe(true);
    expect(dispatched.some((a) => a.type === "setTablesAttribute")).toBe(true);
  });

  it("should change root operation type if root is NO_OP", async () => {
    vi.spyOn(operationsSlice, "selectRootOperation").mockReturnValue(
      rootOperationId
    );
    vi.spyOn(operationsSlice, "selectOperation").mockImplementation(() => ({
      id: rootOperationId,
      operationType: operationsSlice.OPERATION_TYPE_NO_OP,
    }));
    const updateOperations = vi
      .spyOn(operationsSlice, "updateOperations")
      .mockImplementation((payload) => ({
        type: "updateOperations",
        payload,
      }));
    const addChildToOperation = vi
      .spyOn(operationsSlice, "addChildToOperation")
      .mockImplementation((payload) => ({
        type: "addChildToOperation",
        payload,
      }));
    const setTablesAttribute = vi
      .spyOn(tablesSlice, "setTablesAttribute")
      .mockImplementation((payload) => ({
        type: "setTablesAttribute",
        payload,
      }));

    const dispatched = await recordSaga(
      addTableToSchemaSagaWorker,
      { payload: { tableId, operationType } },
      {}
    );

    expect(updateOperations).toHaveBeenCalledWith({
      id: rootOperationId,
      operationType,
    });
    expect(addChildToOperation).toHaveBeenCalledWith({
      operationId: rootOperationId,
      childId: tableId,
    });
    expect(setTablesAttribute).toHaveBeenCalledWith({
      ids: tableId,
      attribute: "operationId",
      value: rootOperationId,
    });
  });

  it("should add child if root operation type matches", async () => {
    vi.spyOn(operationsSlice, "selectRootOperation").mockReturnValue(
      rootOperationId
    );
    vi.spyOn(operationsSlice, "selectOperation").mockImplementation(() => ({
      id: rootOperationId,
      operationType,
    }));
    const addChildToOperation = vi
      .spyOn(operationsSlice, "addChildToOperation")
      .mockImplementation((payload) => ({
        type: "addChildToOperation",
        payload,
      }));
    const setTablesAttribute = vi
      .spyOn(tablesSlice, "setTablesAttribute")
      .mockImplementation((payload) => ({
        type: "setTablesAttribute",
        payload,
      }));

    const dispatched = await recordSaga(
      addTableToSchemaSagaWorker,
      { payload: { tableId, operationType } },
      {}
    );

    expect(addChildToOperation).toHaveBeenCalledWith({
      operationId: rootOperationId,
      childId: tableId,
    });
    expect(setTablesAttribute).toHaveBeenCalledWith({
      ids: tableId,
      attribute: "operationId",
      value: rootOperationId,
    });
  });

  it("should create new operation if root type differs", async () => {
    vi.spyOn(operationsSlice, "selectRootOperation").mockReturnValue(
      rootOperationId
    );
    vi.spyOn(operationsSlice, "selectOperation").mockImplementation(() => ({
      id: rootOperationId,
      operationType: "UNION",
    }));
    const addOperation = vi
      .spyOn(operationsSlice, "addOperation")
      .mockImplementation((op) => ({ type: "addOperation", payload: op }));
    const setTablesAttribute = vi
      .spyOn(tablesSlice, "setTablesAttribute")
      .mockImplementation((payload) => ({
        type: "setTablesAttribute",
        payload,
      }));

    const dispatched = await recordSaga(
      addTableToSchemaSagaWorker,
      { payload: { tableId, operationType } },
      {}
    );

    expect(addOperation).toHaveBeenCalled();
    expect(setTablesAttribute).toHaveBeenCalledWith({
      ids: tableId,
      attribute: "operationId",
      value: newOperationId,
    });
  });
});
