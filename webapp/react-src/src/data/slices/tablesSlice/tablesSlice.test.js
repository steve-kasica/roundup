import { describe, it, expect } from "vitest";
import tablesSlice, {
  addTables,
  removeTables,
  addTablesToLoading,
  removeTablesFromLoading,
  changeTableName,
  incrementRowsExplored,
  setTableColumnIds,
} from "./tablesSlice";

const getInitialState = () => ({
  ids: [],
  data: {},
  loading: [],
  error: null,
});

describe("tablesSlice reducers", () => {
  it("addTables: adds a single table", () => {
    const state = getInitialState();
    const table = { id: "1", name: "Table 1", rowsExplored: 0 };
    const nextState = tablesSlice.reducer(state, addTables(table));
    expect(nextState.ids).toContain("1");
    expect(nextState.data["1"]).toEqual(table);
  });

  it("addTables: adds multiple tables", () => {
    const state = getInitialState();
    const tables = [
      { id: "1", name: "Table 1", rowsExplored: 0 },
      { id: "2", name: "Table 2", rowsExplored: 0 },
    ];
    const nextState = tablesSlice.reducer(state, addTables(tables));
    expect(nextState.ids).toEqual(["1", "2"]);
    expect(nextState.data["1"]).toEqual(tables[0]);
    expect(nextState.data["2"]).toEqual(tables[1]);
  });

  it("addTables: throws if table already exists", () => {
    const state = {
      ...getInitialState(),
      ids: ["1"],
      data: { 1: { id: "1", name: "Table 1", rowsExplored: 0 } },
    };
    const table = { id: "1", name: "Table 1", rowsExplored: 0 };
    expect(() => tablesSlice.reducer(state, addTables(table))).toThrow();
  });

  it("removeTables: removes a single table", () => {
    const state = {
      ...getInitialState(),
      ids: ["1"],
      data: { 1: { id: "1", name: "Table 1", rowsExplored: 0 } },
    };
    const nextState = tablesSlice.reducer(state, removeTables("1"));
    expect(nextState.ids).toEqual([]);
    expect(nextState.data["1"]).toBeUndefined();
  });

  it("removeTables: removes multiple tables", () => {
    const state = {
      ...getInitialState(),
      ids: ["1", "2"],
      data: {
        1: { id: "1", name: "Table 1", rowsExplored: 0 },
        2: { id: "2", name: "Table 2", rowsExplored: 0 },
      },
    };
    const nextState = tablesSlice.reducer(state, removeTables(["1", "2"]));
    expect(nextState.ids).toEqual([]);
    expect(nextState.data["1"]).toBeUndefined();
    expect(nextState.data["2"]).toBeUndefined();
  });

  it("removeTables: throws if table does not exist", () => {
    const state = getInitialState();
    expect(() =>
      tablesSlice.reducer(state, removeTables("not-exist"))
    ).toThrow();
  });

  it("addTablesToLoading: adds single and multiple IDs", () => {
    let state = getInitialState();
    state = tablesSlice.reducer(state, addTablesToLoading("1"));
    expect(state.loading).toEqual(["1"]);
    state = tablesSlice.reducer(state, addTablesToLoading(["2", "3"]));
    expect(state.loading).toEqual(["1", "2", "3"]);
  });

  it("removeTablesFromLoading: removes single and multiple IDs", () => {
    let state = { ...getInitialState(), loading: ["1", "2", "3"] };
    state = tablesSlice.reducer(state, removeTablesFromLoading("1"));
    expect(state.loading).toEqual(["2", "3"]);
    state = tablesSlice.reducer(state, removeTablesFromLoading(["2", "3"]));
    expect(state.loading).toEqual([]);
  });

  it("changeTableName: changes the name of a table", () => {
    const state = {
      ...getInitialState(),
      ids: ["1"],
      data: { 1: { id: "1", name: "Old Name", rowsExplored: 0 } },
    };
    const nextState = tablesSlice.reducer(
      state,
      changeTableName({ tableId: "1", newName: "New Name" })
    );
    expect(nextState.data["1"].name).toBe("New Name");
  });

  it("changeTableName: throws if table does not exist", () => {
    const state = getInitialState();
    expect(() =>
      tablesSlice.reducer(
        state,
        changeTableName({ tableId: "x", newName: "Name" })
      )
    ).toThrow();
  });

  it("incrementRowsExplored: increments rowsExplored", () => {
    const state = {
      ...getInitialState(),
      ids: ["1"],
      data: { 1: { id: "1", name: "Table", rowsExplored: 5 } },
    };
    const nextState = tablesSlice.reducer(
      state,
      incrementRowsExplored({ tableId: "1", rowsExplored: 3 })
    );
    expect(nextState.data["1"].rowsExplored).toBe(8);
  });

  it("incrementRowsExplored: throws if table does not exist", () => {
    const state = getInitialState();
    expect(() =>
      tablesSlice.reducer(
        state,
        incrementRowsExplored({ tableId: "x", rowsExplored: 1 })
      )
    ).toThrow();
  });

  it("setTableColumnIds: sets the column IDs of a table", () => {
    const state = {
      ...getInitialState(),
      ids: ["1"],
      data: { 1: { id: "1", name: "Table", rowsExplored: 0, columnIds: [] } },
    };
    const columnIds = ["col1", "col2", "col3"];
    const nextState = tablesSlice.reducer(
      state,
      setTableColumnIds({ tableId: "1", columnIds })
    );
    expect(nextState.data["1"].columnIds).toEqual(columnIds);
  });

  it("setTableColumnIds: sets columnIds for a table", () => {
    const state = {
      ...getInitialState(),
      ids: ["1"],
      data: {
        1: { id: "1", name: "Table 1", rowsExplored: 0, columnIds: ["a", "b"] },
      },
    };
    const newColumnIds = ["c", "d", "e"];
    const nextState = tablesSlice.reducer(
      state,
      setTableColumnIds({ tableId: "1", columnIds: newColumnIds })
    );
    expect(nextState.data["1"].columnIds).toEqual(newColumnIds);
  });

  it("setTableColumnIds: throws if table does not exist", () => {
    const state = getInitialState();
    expect(() =>
      tablesSlice.reducer(
        state,
        setTableColumnIds({ tableId: "not-exist", columnIds: ["x"] })
      )
    ).toThrow();
  });
});
