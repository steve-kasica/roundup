import { describe, it, expect } from "vitest";
import tablesSlice, {
  initialState,
  addTables,
  updateTables,
  deleteTables,
  setTablesColumnIds,
} from "./tablesSlice";
import { Table } from "./Table";

describe("tablesSlice reducers", () => {
  describe("addTables", () => {
    it("adds a single table", () => {
      const state = initialState;
      const table = Table();
      const nextState = tablesSlice.reducer(state, addTables(table));
      expect(nextState.allIds).toContain(table.id);
      expect(nextState.byId[table.id]).toEqual(table);
    });
    it("adds multiple tables", () => {
      const state = initialState;
      const tables = [Table(), Table()];
      const nextState = tablesSlice.reducer(state, addTables(tables));
      expect(nextState.allIds).toEqual([tables[0].id, tables[1].id]);
      expect(nextState.byId[tables[0].id]).toEqual(tables[0]);
      expect(nextState.byId[tables[1].id]).toEqual(tables[1]);
    });
    it("throws if table already exists", () => {
      const table = Table();
      const state = {
        ...initialState,
        allIds: [table.id],
        byId: { [table.id]: table },
      };
      expect(() => tablesSlice.reducer(state, addTables(table))).toThrow();
    });
  });
  describe("updateTables", () => {
    it("updates a single table", () => {
      const table = Table();
      const state = {
        ...initialState,
        allIds: [table.id],
        byId: { [table.id]: table },
      };
      const updatedTable = { ...table, name: "New Name" };
      const nextState = tablesSlice.reducer(state, updateTables(updatedTable));
      expect(nextState.byId[table.id].name).toBe("New Name");
    });

    it("updates multiple tables", () => {
      const table1 = Table();
      const table2 = Table();
      const state = {
        ...initialState,
        allIds: [table1.id, table2.id],
        byId: { [table1.id]: table1, [table2.id]: table2 },
      };
      const updatedTable1 = { ...table1, name: "New Name 1" };
      const updatedTable2 = { ...table2, name: "New Name 2" };
      const nextState = tablesSlice.reducer(
        state,
        updateTables([updatedTable1, updatedTable2])
      );
      expect(nextState.byId[table1.id].name).toBe("New Name 1");
      expect(nextState.byId[table2.id].name).toBe("New Name 2");
    });

    it("throws if table does not exist", () => {
      const state = initialState;
      const nonExistentTable = Table();
      expect(() =>
        tablesSlice.reducer(state, updateTables(nonExistentTable))
      ).toThrow();
    });
  });
  describe("deleteTables", () => {
    it("deletes a single table", () => {
      const table = Table();
      const state = {
        ...initialState,
        allIds: [table.id],
        byId: { [table.id]: table },
      };
      const nextState = tablesSlice.reducer(state, deleteTables(table.id));
      expect(nextState.allIds).not.toContain(table.id);
      expect(nextState.byId[table.id]).toBeUndefined();
    });

    it("deletes multiple tables", () => {
      const table1 = Table();
      const table2 = Table();
      const state = {
        ...initialState,
        allIds: [table1.id, table2.id],
        byId: { [table1.id]: table1, [table2.id]: table2 },
      };
      const nextState = tablesSlice.reducer(
        state,
        deleteTables([table1.id, table2.id])
      );
      expect(nextState.allIds).not.toContain(table1.id);
      expect(nextState.allIds).not.toContain(table2.id);
      expect(nextState.byId[table1.id]).toBeUndefined();
      expect(nextState.byId[table2.id]).toBeUndefined();
    });

    it("throws if table does not exist", () => {
      const state = initialState;
      expect(() =>
        tablesSlice.reducer(state, deleteTables("non-existent-id"))
      ).toThrow();
    });
  });
});
