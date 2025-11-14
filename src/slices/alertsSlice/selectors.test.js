import { describe, beforeAll, expect, it } from "vitest";
import IncongruentTablesAlert from "./Alerts/Errors/IncongruentTables";
import Operation, {
  OPERATION_TYPE_PACK,
  OPERATION_TYPE_STACK,
} from "../operationsSlice/Operation";
import MissingLeftJoinKeyAlert from "./Alerts/Errors/MissingLeftJoinKey";
import MissingRightJoinKeyAlert from "./Alerts/Errors/MissingRightJoinKey";
import { initialState } from "./alertsSlice";
import {
  selectAlertIdsBySourceId,
  selectAlertsById,
  selectAllSourceIdsWithAlerts,
} from "./selectors";

describe("Alerts selectors", () => {
  let state, alert1, alert2, alert3, operation1, operation2;

  beforeAll(() => {
    operation1 = Operation({ operationType: OPERATION_TYPE_STACK });
    operation2 = Operation({ operationType: OPERATION_TYPE_PACK });
    alert1 = IncongruentTablesAlert(operation1.id);
    alert2 = MissingLeftJoinKeyAlert(operation2.id);
    alert3 = MissingRightJoinKeyAlert(operation2.id);
    state = {
      alerts: {
        byId: {
          [alert1.id]: alert1,
          [alert2.id]: alert2,
          [alert3.id]: alert3,
        },
        allIds: [alert1.id, alert2.id, alert3.id],
      },
    };
  });

  describe("selectAlertIdsBySourceId", () => {
    it("returns alert IDs for single source ID", () => {
      const result1 = selectAlertIdsBySourceId(state, operation1.id);
      expect(result1).toEqual([alert1.id]);
    });

    it("returns multiple alert IDs for source ID", () => {
      const result2 = selectAlertIdsBySourceId(state, operation2.id);
      expect(result2).toEqual([alert2.id, alert3.id]);
    });

    it("returns an empty array if no alerts exist for the source ID", () => {
      const result2 = selectAlertIdsBySourceId(state, "non-existent-source-id");
      expect(result2).toEqual([]);
    });
  });

  describe("selectAlertsById", () => {
    it("returns alerts for given alert IDs", () => {
      const result = selectAlertsById(state, [alert1.id, alert2.id]);
      expect(result).toEqual([alert1, alert2]);
    });
    it("returns a single alert for a single alert ID", () => {
      const result = selectAlertsById(state, alert3.id);
      expect(result).toEqual(alert3);
    });
  });
  describe("selectAllSourceIdsWithAlerts", () => {
    it("returns all source IDs that have alerts", () => {
      const result = selectAllSourceIdsWithAlerts(state);
      expect(result).toEqual([operation1.id, operation2.id]);
    });
  });
});
