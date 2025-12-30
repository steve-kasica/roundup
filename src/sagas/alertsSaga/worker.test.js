import { describe, it, expect } from "vitest";
import { expectSaga } from "redux-saga-test-plan";
import alertsSagaWorker from "./worker";
import {
  addAlerts as addAlertsToSlice,
  deleteAlerts as deleteAlertsFromSlice,
} from "../../slices/alertsSlice/alertsSlice";

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
  describe("adding new alerts", () => {
    it("adds a new alert when it does not exist and is not passing", async () => {
      const raisedAlerts = [
        {
          id: "source_1",
          alerts: [
            {
              id: "alert_1",
              sourceId: "source_1",
              isPassing: false,
              message: "Error",
            },
          ],
        },
      ];

      const initialState = createMockState({});

      const { effects } = await expectSaga(alertsSagaWorker, raisedAlerts)
        .withState(initialState)
        .run();

      const addAlertsAction = effects.put.find(
        (effect) => effect.payload.action.type === addAlertsToSlice.type
      );

      expect(addAlertsAction).toBeDefined();
      expect(addAlertsAction.payload.action.payload).toHaveLength(1);
      expect(addAlertsAction.payload.action.payload[0]).toMatchObject({
        id: "alert_1",
        sourceId: "source_1",
        isPassing: false,
      });
    });

    it("adds multiple new alerts from the same source", async () => {
      const raisedAlerts = [
        {
          id: "source_1",
          alerts: [
            {
              id: "alert_1",
              sourceId: "source_1",
              isPassing: false,
              message: "Error 1",
            },
            {
              id: "alert_2",
              sourceId: "source_1",
              isPassing: false,
              message: "Error 2",
            },
          ],
        },
      ];

      const initialState = createMockState({});

      const { effects } = await expectSaga(alertsSagaWorker, raisedAlerts)
        .withState(initialState)
        .run();

      const addAlertsAction = effects.put.find(
        (effect) => effect.payload.action.type === addAlertsToSlice.type
      );

      expect(addAlertsAction).toBeDefined();
      expect(addAlertsAction.payload.action.payload).toHaveLength(2);
    });
  });

  describe("deleting resolved alerts", () => {
    it("deletes an alert when it exists and is now passing", async () => {
      const raisedAlerts = [
        {
          id: "source_1",
          alerts: [
            {
              id: "alert_1",
              sourceId: "source_1",
              isPassing: true,
              message: "Resolved",
            },
          ],
        },
      ];

      const initialState = createMockState({
        alert_1: { id: "alert_1", sourceId: "source_1", isPassing: false },
      });

      const { effects } = await expectSaga(alertsSagaWorker, raisedAlerts)
        .withState(initialState)
        .run();

      const deleteAlertsAction = effects.put.find(
        (effect) => effect.payload.action.type === deleteAlertsFromSlice.type
      );

      expect(deleteAlertsAction).toBeDefined();
      expect(deleteAlertsAction.payload.action.payload).toContain("alert_1");
    });

    it("deletes orphaned alerts that are no longer raised", async () => {
      const raisedAlerts = [
        {
          id: "source_1",
          alerts: [], // No alerts raised anymore
        },
      ];

      const initialState = createMockState({
        alert_1: { id: "alert_1", sourceId: "source_1", isPassing: false },
        alert_2: { id: "alert_2", sourceId: "source_1", isPassing: false },
      });

      const { effects } = await expectSaga(alertsSagaWorker, raisedAlerts)
        .withState(initialState)
        .run();

      const deleteAlertsAction = effects.put.find(
        (effect) => effect.payload.action.type === deleteAlertsFromSlice.type
      );

      expect(deleteAlertsAction).toBeDefined();
      expect(deleteAlertsAction.payload.action.payload).toContain("alert_1");
      expect(deleteAlertsAction.payload.action.payload).toContain("alert_2");
    });
  });

  describe("no action needed scenarios", () => {
    it("does not add or delete when alert already exists and is not passing", async () => {
      const raisedAlerts = [
        {
          id: "source_1",
          alerts: [
            {
              id: "alert_1",
              sourceId: "source_1",
              isPassing: false,
              message: "Error",
            },
          ],
        },
      ];

      const initialState = createMockState({
        alert_1: { id: "alert_1", sourceId: "source_1", isPassing: false },
      });

      const { effects } = await expectSaga(alertsSagaWorker, raisedAlerts)
        .withState(initialState)
        .run();

      // No put effects should be dispatched
      expect(effects.put).toBeUndefined();
    });

    it("does not dispatch actions when a new alert is passing (never raised)", async () => {
      const raisedAlerts = [
        {
          id: "source_1",
          alerts: [
            {
              id: "alert_1",
              sourceId: "source_1",
              isPassing: true,
              message: "OK",
            },
          ],
        },
      ];

      const initialState = createMockState({});

      const { effects } = await expectSaga(alertsSagaWorker, raisedAlerts)
        .withState(initialState)
        .run();

      // No put effects should be dispatched
      expect(effects.put).toBeUndefined();
    });
  });

  describe("mixed scenarios", () => {
    it("handles multiple sources with different alert states", async () => {
      const raisedAlerts = [
        {
          id: "source_1",
          alerts: [
            {
              id: "alert_1",
              sourceId: "source_1",
              isPassing: false,
              message: "New error",
            },
          ],
        },
        {
          id: "source_2",
          alerts: [
            {
              id: "alert_2",
              sourceId: "source_2",
              isPassing: true,
              message: "Resolved",
            },
          ],
        },
      ];

      const initialState = createMockState({
        // source_1 has no existing alerts
        // source_2 has an existing alert that will be resolved
        alert_2: { id: "alert_2", sourceId: "source_2", isPassing: false },
      });

      const { effects } = await expectSaga(alertsSagaWorker, raisedAlerts)
        .withState(initialState)
        .run();

      // Should have both add and delete actions
      const addAlertsAction = effects.put.find(
        (effect) => effect.payload.action.type === addAlertsToSlice.type
      );
      const deleteAlertsAction = effects.put.find(
        (effect) => effect.payload.action.type === deleteAlertsFromSlice.type
      );

      expect(addAlertsAction).toBeDefined();
      expect(deleteAlertsAction).toBeDefined();
    });

    it("adds new alerts while keeping existing non-passing alerts", async () => {
      const raisedAlerts = [
        {
          id: "source_1",
          alerts: [
            {
              id: "alert_1",
              sourceId: "source_1",
              isPassing: false,
              message: "Existing",
            },
            {
              id: "alert_2",
              sourceId: "source_1",
              isPassing: false,
              message: "New",
            },
          ],
        },
      ];

      const initialState = createMockState({
        alert_1: { id: "alert_1", sourceId: "source_1", isPassing: false },
      });

      const { effects } = await expectSaga(alertsSagaWorker, raisedAlerts)
        .withState(initialState)
        .run();

      const addAlertsAction = effects.put.find(
        (effect) => effect.payload.action.type === addAlertsToSlice.type
      );

      expect(addAlertsAction).toBeDefined();
      expect(addAlertsAction.payload.action.payload).toHaveLength(1);
      expect(addAlertsAction.payload.action.payload[0].id).toBe("alert_2");

      // No delete action since alert_1 is still not passing
      const deleteAlertsAction = effects.put?.find(
        (effect) => effect.payload.action.type === deleteAlertsFromSlice.type
      );
      expect(deleteAlertsAction).toBeUndefined();
    });

    it("simultaneously adds new alerts and deletes resolved alerts", async () => {
      const raisedAlerts = [
        {
          id: "source_1",
          alerts: [
            {
              id: "alert_1",
              sourceId: "source_1",
              isPassing: true,
              message: "Resolved",
            },
            {
              id: "alert_2",
              sourceId: "source_1",
              isPassing: false,
              message: "New error",
            },
          ],
        },
      ];

      const initialState = createMockState({
        alert_1: { id: "alert_1", sourceId: "source_1", isPassing: false },
      });

      const { effects } = await expectSaga(alertsSagaWorker, raisedAlerts)
        .withState(initialState)
        .run();

      const addAlertsAction = effects.put.find(
        (effect) => effect.payload.action.type === addAlertsToSlice.type
      );
      const deleteAlertsAction = effects.put.find(
        (effect) => effect.payload.action.type === deleteAlertsFromSlice.type
      );

      expect(addAlertsAction).toBeDefined();
      expect(addAlertsAction.payload.action.payload[0].id).toBe("alert_2");

      expect(deleteAlertsAction).toBeDefined();
      expect(deleteAlertsAction.payload.action.payload).toContain("alert_1");
    });
  });

  describe("edge cases", () => {
    it("handles empty raisedAlerts array", async () => {
      const raisedAlerts = [];

      const { effects } = await expectSaga(
        alertsSagaWorker,
        raisedAlerts
      ).run();

      expect(effects.put).toBeUndefined();
    });

    it("handles source with empty alerts array", async () => {
      const raisedAlerts = [
        {
          id: "source_1",
          alerts: [],
        },
      ];

      const initialState = createMockState({});

      const { effects } = await expectSaga(alertsSagaWorker, raisedAlerts)
        .withState(initialState)
        .run();

      expect(effects.put).toBeUndefined();
    });
  });
});
