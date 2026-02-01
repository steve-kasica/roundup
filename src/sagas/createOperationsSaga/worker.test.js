import { describe, it, vi } from "vitest";
import { expectSaga } from "redux-saga-test-plan";
import createOperationsWorker from "./worker";
import { addOperations as addOperationsToSlice } from "../../slices/operationsSlice";
import { createOperationsSuccess } from "./actions";
import { OPERATION_TYPE_PACK } from "../../slices/operationsSlice/Operation";

// Mock generateUUID to return predictable values
vi.mock("../../lib/utilities/generateUUID", () => ({
  default: vi.fn((prefix) => `${prefix}mock-uuid`),
}));

describe("createOperationsWorker", () => {
  it("calls addOperationsToSlice and createOperationsSuccess", async () => {
    const operationsData = [
      {
        operationType: OPERATION_TYPE_PACK,
        childIds: ["t1", "t2"],
      },
    ];
    await expectSaga(createOperationsWorker, operationsData)
      .put.actionType(addOperationsToSlice.type)
      .put.actionType(createOperationsSuccess.type)
      .run();
  });
});
