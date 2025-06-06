import { describe, it, expect } from "vitest";
import columnsSlice, { addColumns, updateColumns } from "./columnsSlice";
import Column, {
  COLUMN_TYPE_NUMERICAL,
  COLUMN_TYPE_CATEGORICAL,
} from "./Column";

const getInitialState = () => ({
  idsByTable: {},
  data: {},
  selected: [],
  hovered: [],
  loading: [],
  dragging: [],
  errors: {},
});

describe("columnsSlice reducers", () => {
  it("addColumns: adds a single column", () => {
    const state = getInitialState();
    const column = Column("t1", 0, "A", COLUMN_TYPE_NUMERICAL);
    const nextState = columnsSlice(state, addColumns(column));
    expect(Object.values(nextState.data)).toHaveLength(1);
    expect(nextState.data[column.id]).toEqual(column);
    expect(nextState.idsByTable["t1"]).toContain(column.id);
  });

  it("addColumns: adds multiple columns", () => {
    const state = getInitialState();
    const columns = [
      Column("t1", 0, "A", COLUMN_TYPE_NUMERICAL),
      Column("t1", 1, "B", COLUMN_TYPE_CATEGORICAL),
    ];
    const nextState = columnsSlice(state, addColumns(columns));
    expect(Object.values(nextState.data)).toHaveLength(2);
    expect(nextState.idsByTable["t1"]).toEqual([columns[0].id, columns[1].id]);
  });

  it("addColumns: throws if column already exists", () => {
    const column = Column("t1", 0, "A", COLUMN_TYPE_NUMERICAL);
    const state = {
      ...getInitialState(),
      data: { [column.id]: column },
      idsByTable: { t1: [column.id] },
    };
    expect(() => columnsSlice(state, addColumns(column))).toThrow();
  });

  it("updateColumns: updates a single column", () => {
    const column = Column("t1", 0, "A", COLUMN_TYPE_NUMERICAL);
    const state = {
      ...getInitialState(),
      data: { [column.id]: column },
      idsByTable: { t1: [column.id] },
    };
    const updated = { ...column, name: "A-updated" };
    const nextState = columnsSlice(state, updateColumns(updated));
    expect(nextState.data[column.id].name).toBe("A-updated");
  });

  it("updateColumns: updates multiple columns", () => {
    const col1 = Column("t1", 0, "A", COLUMN_TYPE_NUMERICAL);
    const col2 = Column("t1", 1, "B", COLUMN_TYPE_CATEGORICAL);
    const state = {
      ...getInitialState(),
      data: { [col1.id]: col1, [col2.id]: col2 },
      idsByTable: { t1: [col1.id, col2.id] },
    };
    const updated = [
      { ...col1, name: "A-updated" },
      { ...col2, name: "B-updated" },
    ];
    const nextState = columnsSlice(state, updateColumns(updated));
    expect(nextState.data[col1.id].name).toBe("A-updated");
    expect(nextState.data[col2.id].name).toBe("B-updated");
  });

  it("updateColumns: throws if column does not exist", () => {
    const col = Column("t1", 0, "A", COLUMN_TYPE_NUMERICAL);
    const state = getInitialState();
    expect(() => columnsSlice(state, updateColumns(col))).toThrow();
  });
});
