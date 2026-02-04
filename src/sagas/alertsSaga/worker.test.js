import { describe, it, vi, expect } from "vitest";
import { expectSaga } from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";
import {
  processAlerts,
  validateOperationWorker,
  validatePackOperationWorker,
  validateStackOperationWorker,
} from "./worker";
import {
  addAlerts as addAlertsToSlice,
  deleteAlerts,
} from "../../slices/alertsSlice/alertsSlice";
import {
  OPERATION_TYPE_PACK,
  OPERATION_TYPE_STACK,
} from "../../slices/operationsSlice";
import {
  validateIncongruentTables,
  validateMissingJoinPredicate,
  validateMissingJoinType,
  validateMissingLeftJoinKey,
  validateMissingRightJoinKey,
} from "../../slices/alertsSlice";
import { validateHeterogeneousColumnTypes } from "../../slices/alertsSlice/Alerts/Warnings/HeterogeneousColumnTypes";

vi.mock("../../slices/alertsSlice", async () => {
  const actual = await vi.importActual("../../slices/alertsSlice");
  return {
    ...actual,
    validateIncongruentTables: vi.fn(() => ({
      id: "test_alert",
      isPassing: true,
    })),
    // Pack operation validations
    validateMissingJoinPredicate: vi.fn(() => ({
      id: "test_alert",
      isPassing: true,
    })),
    validateMissingJoinType: vi.fn(() => ({
      id: "test_alert",
      isPassing: true,
    })),
    validateMissingLeftJoinKey: vi.fn(() => ({
      id: "test_alert",
      isPassing: true,
    })),
    validateMissingRightJoinKey: vi.fn(() => ({
      id: "test_alert",
      isPassing: true,
    })),
  };
});

vi.mock(
  "../../slices/alertsSlice/Alerts/Warnings/HeterogeneousColumnTypes",
  () => ({
    validateHeterogeneousColumnTypes: vi.fn(() => ({
      id: "test_alert",
      isPassing: true,
    })),
  }),
);

/**
 * Helper to create a mock state with alerts
 * @param {Object} alertsById - Object mapping alert IDs to alert objects
 * @returns {Object} Mock Redux state with alerts slice
 */
const createMockState = (alertsById = {}) => ({
  alerts: {
    byId: alertsById,
    allIds: Object.keys(alertsById),
  },
});

describe("alertsSagaWorker saga", () => {
  describe("validateOperationWorker", () => {
    it("should call validateStackOperationWorker for STACK operations", () => {
      const operations = [
        {
          id: "o1",
          operationType: OPERATION_TYPE_STACK,
        },
      ];
      return expectSaga(validateOperationWorker, operations)
        .provide([
          [matchers.call.fn(validateStackOperationWorker, operations[0])],
        ])
        .call(validateStackOperationWorker, operations[0])
        .run();
    });

    it("should call validatePackOperationWorker for PACK operations", () => {
      const operations = [
        {
          id: "o1",
          operationType: OPERATION_TYPE_PACK,
        },
      ];
      return expectSaga(validateOperationWorker, operations)
        .provide([
          [matchers.call.fn(validatePackOperationWorker, operations[0])],
        ])
        .call(validatePackOperationWorker, operations[0])
        .run();
    });
  });

  describe("processAlerts", () => {
    it("should add new alerts when they are raised", () => {
      const raisedAlerts = [
        {
          id: "t1",
          alerts: [
            {
              id: "t1_ERROR1",
              code: "ERROR1",
              sourceId: "t1",
              isPassing: false,
              message: "Error",
            },
          ],
        },
      ];

      const initialState = createMockState({
        t1_ERROR2: {
          id: "t1_ERROR2",
          code: "ERROR2",
          sourceId: "t1",
          isPassing: false,
        },
      });
      return expectSaga(processAlerts, raisedAlerts)
        .withState(initialState)
        .put(addAlertsToSlice([raisedAlerts[0].alerts[0]]))
        .run();
    });
    it("should delete existing alerts if they're passing", () => {
      const raisedAlerts = [
        {
          id: "t1",
          alerts: [
            {
              id: "t1_ERROR1",
              code: "ERROR1",
              sourceId: "t1",
              isPassing: true,
              message: "Error",
            },
          ],
        },
      ];

      const initialState = createMockState({
        t1_ERROR1: {
          id: "t1_ERROR1",
          code: "ERROR1",
          sourceId: "t1",
          isPassing: false,
          message: "Error",
        },
      });
      return expectSaga(processAlerts, raisedAlerts)
        .withState(initialState)
        .put(deleteAlerts([raisedAlerts[0].alerts[0].id]))
        .run();
    });

    it("should not modify existing alerts that are still failing", () => {
      const raisedAlerts = [
        {
          id: "t1",
          alerts: [
            {
              id: "t1_ERROR1",
              code: "ERROR1",
              sourceId: "t1",
              isPassing: false,
              message: "Error",
            },
          ],
        },
      ];

      const initialState = createMockState({
        t1_ERROR1: {
          id: "t1_ERROR1",
          code: "ERROR1",
          sourceId: "t1",
          isPassing: false,
        },
      });
      return expectSaga(processAlerts, raisedAlerts)
        .withState(initialState)
        .not.put(addAlertsToSlice([raisedAlerts[0].alerts[0]]))
        .run();
    });
  });

  describe("validatePackOperationWorker", () => {
    it("calls validation functions and processAlerts", () => {
      const operation = {
        id: "o1",
        operationType: OPERATION_TYPE_PACK,
        leftJoinKey: "id",
        rightJoinKey: "user_id",
        joinPredicate: "=",
        joinType: "INNER",
      };

      const mockState = {
        alerts: {
          byId: {},
          allIds: [],
        },
      };

      return expectSaga(validatePackOperationWorker, operation)
        .withState(mockState)
        .call.fn(processAlerts)
        .run()
        .then(() => {
          expect(validateMissingLeftJoinKey).toHaveBeenCalledWith(operation);
          expect(validateMissingRightJoinKey).toHaveBeenCalledWith(operation);
          expect(validateMissingJoinPredicate).toHaveBeenCalledWith(operation);
          expect(validateMissingJoinType).toHaveBeenCalledWith(operation);
        });
    });
  });

  describe("validateStackOperationWorker", () => {
    it("calls validation functions and processAlerts", () => {
      const operation = {
        id: "o1",
        operationType: OPERATION_TYPE_STACK,
        childIds: ["t1", "t2"],
      };

      const mockState = {
        alerts: {
          byId: {},
          allIds: [],
        },
        operations: {
          byId: {
            o1: operation,
          },
          allIds: ["o1"],
        },
        tables: {
          byId: {
            t1: {
              id: "t1",
              name: "Users",
              columnIds: ["c1"],
              databaseName: "users",
            },
            t2: {
              id: "t2",
              name: "Orders",
              columnIds: ["c2"],
              databaseName: "orders",
            },
          },
          allIds: ["t1", "t2"],
        },
        columns: {
          byId: {
            c1: { id: "c1", parentId: "t1", columnType: "STRING" },
            c2: { id: "c2", parentId: "t2", columnType: "INTEGER" },
          },
          allIds: ["c1", "c2"],
        },
      };

      return expectSaga(validateStackOperationWorker, operation)
        .withState(mockState)
        .call.fn(processAlerts)
        .run()
        .then(() => {
          expect(validateIncongruentTables).toHaveBeenCalledWith(
            operation,
            expect.any(Array),
          );
          expect(validateHeterogeneousColumnTypes).toHaveBeenCalledWith(
            operation,
            expect.any(Array),
          );
        });
    });
  });
});
