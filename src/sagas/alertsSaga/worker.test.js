import { describe, it } from "vitest";
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
});
