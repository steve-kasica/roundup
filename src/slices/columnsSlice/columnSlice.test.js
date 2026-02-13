import { describe, it, expect } from "vitest";
import columnsSlice, {
  initialState,
  addColumns,
  updateColumns,
  deleteColumns,
} from "./columnsSlice";
import Column from "./Column";

describe("columnsSlice reducers", () => {
  describe("addColumns", () => {
    it("adds a single column", () => {
      const state = initialState;
      const column = Column("t1", 0);
      const nextState = columnsSlice(state, addColumns(column));
      expect(Object.values(nextState.byId)).toHaveLength(1);
      expect(nextState.byId[column.id]).toEqual(column);
    });
    it("adds multiple columns", () => {
      const state = initialState;
      const columns = [Column("t1", 0), Column("t1", 1)];
      const nextState = columnsSlice(state, addColumns(columns));
      expect(Object.values(nextState.byId)).toHaveLength(2);
    });
    it("throws if column already exists", () => {
      const column = Column("t1", 0);
      const state = {
        ...initialState,
        byId: { [column.id]: column },
      };
      expect(() => columnsSlice(state, addColumns(column))).toThrow();
    });
  });
  describe("updateColumns", () => {
    it("updates a single column", () => {
      const column = Column("t1", 0, "A");
      const state = {
        ...initialState,
        byId: { [column.id]: column },
      };
      const updated = { ...column, name: "A-updated" };
      const nextState = columnsSlice(state, updateColumns(updated));
      expect(nextState.byId[column.id].name).toBe("A-updated");
    });
    it("updates multiple columns", () => {
      const col1 = Column("t1", 0, "A");
      const col2 = Column("t1", 1, "B");
      const state = {
        ...initialState,
        byId: { [col1.id]: col1, [col2.id]: col2 },
      };
      const updated = [
        { ...col1, name: "A-updated" },
        { ...col2, name: "B-updated" },
      ];
      const nextState = columnsSlice(state, updateColumns(updated));
      expect(nextState.byId[col1.id].name).toBe("A-updated");
      expect(nextState.byId[col2.id].name).toBe("B-updated");
    });
    it("throws if column does not exist", () => {
      const col = Column("t1", 0);
      const state = initialState;
      expect(() => columnsSlice(state, updateColumns(col))).toThrow();
    });
  });
  describe("removeColumns", () => {
    it("removes a single column", () => {
      const column = Column("t1", 0);
      const state = {
        ...initialState,
        byId: { [column.id]: column },
      };
      const nextState = columnsSlice(state, deleteColumns(column.id));
      expect(Object.values(nextState.byId)).toHaveLength(0);
    });
    it("removes multiple columns from a single table", () => {
      const col1 = Column("t1", 0);
      const col2 = Column("t1", 1);
      const state = {
        ...initialState,
        byId: { [col1.id]: col1, [col2.id]: col2 },
      };
      const nextState = columnsSlice(state, deleteColumns([col1.id, col2.id]));
      expect(Object.values(nextState.byId)).toHaveLength(0);
    });
    it("removes multiple columns from multiple tables", () => {
      const col1 = Column("t1", 0);
      const col2 = Column("t2", 0);
      const state = {
        ...initialState,
        byId: { [col1.id]: col1, [col2.id]: col2 },
      };
      const nextState = columnsSlice(state, deleteColumns([col1.id, col2.id]));
      expect(Object.values(nextState.byId)).toHaveLength(0);
    });
  });
});
