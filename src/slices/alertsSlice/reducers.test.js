import { describe, it, expect, beforeAll } from "vitest";
import alertsSlice, { initialState, addAlerts } from "./alertsSlice";
import Operation, {
  OPERATION_TYPE_PACK,
  OPERATION_TYPE_STACK,
} from "../operationsSlice/Operation";
import IncongruentTablesAlert from "./Alerts/Errors/IncongruentTables";
import MissingLeftJoinKeyAlert from "./Alerts/Errors/MissingLeftJoinKey";
import MissingRightJoinKeyAlert from "./Alerts/Errors/MissingRightJoinKey";

describe("alertsSlice reducers", () => {
  let state, alert1, alert2, alert3, operation1, operation2;

  beforeAll(() => {
    operation1 = Operation({ operationType: OPERATION_TYPE_STACK });
    operation2 = Operation({ operationType: OPERATION_TYPE_PACK });
    alert1 = IncongruentTablesAlert(operation1.id);
    alert2 = MissingLeftJoinKeyAlert(operation2.id);
    alert3 = MissingRightJoinKeyAlert(operation2.id);
    state = initialState;
  });
  describe("addAlerts", () => {
    it("adds a single alert", () => {
      const nextState = alertsSlice(state, addAlerts(alert1));
      expect(Object.values(nextState.byId)).toHaveLength(1);
      expect(nextState.byId[alert1.id]).toEqual(alert1);
    });
    it("adds multiple alerts", () => {
      const nextState = alertsSlice(state, addAlerts([alert2, alert3]));
      expect(Object.values(nextState.byId)).toHaveLength(2);
    });
    it("does not update the alert if it already exists", () => {
      const duplicateAlert = IncongruentTablesAlert(operation1.id);
      const nextState = alertsSlice(
        {
          byId: {
            [alert1.id]: alert1,
          },
          allIds: [alert1.id],
        },
        addAlerts(duplicateAlert)
      );
      expect(Object.values(nextState.byId)).toHaveLength(1);
      expect(nextState.byId[alert1.id].timeStamp).toEqual(alert1.timeStamp);
    });
  });
  // describe("updateAlerts", () => {
  //   it("updates a single column", () => {
  //     const column = Column("t1", 0, "A");
  //     const state = {
  //       ...initialState,
  //       byId: { [column.id]: column },
  //     };
  //     const updated = { ...column, name: "A-updated" };
  //     const nextState = columnsSlice(state, updateColumns(updated));
  //     expect(nextState.byId[column.id].name).toBe("A-updated");
  //   });
  //   it("updates multiple columns", () => {
  //     const col1 = Column("t1", 0, "A");
  //     const col2 = Column("t1", 1, "B");
  //     const state = {
  //       ...initialState,
  //       byId: { [col1.id]: col1, [col2.id]: col2 },
  //     };
  //     const updated = [
  //       { ...col1, name: "A-updated" },
  //       { ...col2, name: "B-updated" },
  //     ];
  //     const nextState = columnsSlice(state, updateColumns(updated));
  //     expect(nextState.byId[col1.id].name).toBe("A-updated");
  //     expect(nextState.byId[col2.id].name).toBe("B-updated");
  //   });
  //   it("throws if column does not exist", () => {
  //     const col = Column("t1", 0);
  //     const state = initialState;
  //     expect(() => columnsSlice(state, updateColumns(col))).toThrow();
  //   });
  // });
  // describe("removeColumns", () => {
  //   it("removes a single column", () => {
  //     const column = Column("t1", 0);
  //     const state = {
  //       ...initialState,
  //       byId: { [column.id]: column },
  //     };
  //     const nextState = columnsSlice(state, deleteColumns(column.id));
  //     expect(Object.values(nextState.byId)).toHaveLength(0);
  //   });
  //   it("removes multiple columns from a single table", () => {
  //     const col1 = Column("t1", 0);
  //     const col2 = Column("t1", 1);
  //     const state = {
  //       ...initialState,
  //       byId: { [col1.id]: col1, [col2.id]: col2 },
  //     };
  //     const nextState = columnsSlice(state, deleteColumns([col1.id, col2.id]));
  //     expect(Object.values(nextState.byId)).toHaveLength(0);
  //   });
  //   it("removes multiple columns from multiple tables", () => {
  //     const col1 = Column("t1", 0);
  //     const col2 = Column("t2", 0);
  //     const state = {
  //       ...initialState,
  //       byId: { [col1.id]: col1, [col2.id]: col2 },
  //     };
  //     const nextState = columnsSlice(state, deleteColumns([col1.id, col2.id]));
  //     expect(Object.values(nextState.byId)).toHaveLength(0);
  //   });
  //   it("throws if column does not exist", () => {
  //     const col = Column("t1", 0);
  //     const state = initialState;
  //     expect(() => columnsSlice(state, deleteColumns(col.id))).toThrow();
  //   });
  // });
});
