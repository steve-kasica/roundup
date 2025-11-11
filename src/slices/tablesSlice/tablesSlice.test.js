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
      expect(nextState.ids).toContain(table.id);
      expect(nextState.data[table.id]).toEqual(table);
      expect(nextState.childIds[table.id]).toEqual([]);
    });
    it("adds multiple tables", () => {
      const state = initialState;
      const tables = [Table(), Table()];
      const nextState = tablesSlice.reducer(state, addTables(tables));
      expect(nextState.ids).toEqual([tables[0].id, tables[1].id]);
      expect(nextState.data[tables[0].id]).toEqual(tables[0]);
      expect(nextState.data[tables[1].id]).toEqual(tables[1]);
    });
    it("throws if table already exists", () => {
      const table = Table();
      const state = {
        ...initialState,
        ids: [table.id],
        data: { [table.id]: table },
      };
      expect(() => tablesSlice.reducer(state, addTables(table))).toThrow();
    });
  });
  describe("updateTables", () => {
    it("updates a single table", () => {
      const table = Table();
      const state = {
        ...initialState,
        ids: [table.id],
        data: { [table.id]: table },
      };
      const updatedTable = { ...table, name: "New Name" };
      const nextState = tablesSlice.reducer(state, updateTables(updatedTable));
      expect(nextState.data[table.id].name).toBe("New Name");
    });

    it("updates multiple tables", () => {
      const table1 = Table();
      const table2 = Table();
      const state = {
        ...initialState,
        ids: [table1.id, table2.id],
        data: { [table1.id]: table1, [table2.id]: table2 },
      };
      const updatedTable1 = { ...table1, name: "New Name 1" };
      const updatedTable2 = { ...table2, name: "New Name 2" };
      const nextState = tablesSlice.reducer(
        state,
        updateTables([updatedTable1, updatedTable2])
      );
      expect(nextState.data[table1.id].name).toBe("New Name 1");
      expect(nextState.data[table2.id].name).toBe("New Name 2");
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
        ids: [table.id],
        data: { [table.id]: table },
      };
      const nextState = tablesSlice.reducer(state, deleteTables(table.id));
      expect(nextState.ids).not.toContain(table.id);
      expect(nextState.data[table.id]).toBeUndefined();
    });

    it("deletes multiple tables", () => {
      const table1 = Table();
      const table2 = Table();
      const state = {
        ...initialState,
        ids: [table1.id, table2.id],
        data: { [table1.id]: table1, [table2.id]: table2 },
      };
      const nextState = tablesSlice.reducer(
        state,
        deleteTables([table1.id, table2.id])
      );
      expect(nextState.ids).not.toContain(table1.id);
      expect(nextState.ids).not.toContain(table2.id);
      expect(nextState.data[table1.id]).toBeUndefined();
      expect(nextState.data[table2.id]).toBeUndefined();
    });

    it("throws if table does not exist", () => {
      const state = initialState;
      expect(() =>
        tablesSlice.reducer(state, deleteTables("non-existent-id"))
      ).toThrow();
    });
  });
  describe("setTablesColumnIds", () => {
    it("sets column IDs for a single table", () => {
      const table = Table();
      const state = {
        ...initialState,
        ids: [table.id],
        data: { [table.id]: table },
      };
      const columnIds = ["col1", "col2", "col3"];
      const nextState = tablesSlice.reducer(
        state,
        setTablesColumnIds({ tableId: table.id, columnIds })
      );
      expect(nextState.data[table.id].columnIds).toEqual(columnIds);
    });

    it("sets column IDs for multiple tables", () => {
      const table1 = Table();
      const table2 = Table();
      const state = {
        ...initialState,
        ids: [table1.id, table2.id],
        data: { [table1.id]: table1, [table2.id]: table2 },
      };
      const mappings = [
        { tableId: table1.id, columnIds: ["a", "b"] },
        { tableId: table2.id, columnIds: ["c", "d", "e"] },
      ];
      const nextState = tablesSlice.reducer(
        state,
        setTablesColumnIds(mappings)
      );
      expect(nextState.data[table1.id].columnIds).toEqual(["a", "b"]);
      expect(nextState.data[table2.id].columnIds).toEqual(["c", "d", "e"]);
    });

    it("throws if table does not exist", () => {
      const state = initialState;
      expect(() =>
        tablesSlice.reducer(
          state,
          setTablesColumnIds({ tableId: "non-existent-id", columnIds: ["x"] })
        )
      ).toThrow();
    });
  });
});
