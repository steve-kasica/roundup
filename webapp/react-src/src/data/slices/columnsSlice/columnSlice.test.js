import { describe, it, expect } from "vitest";
import columnsSlice, {
  addColumns,
  updateColumns,
  renameColumns,
  removeColumns,
  addColumnsToLoading,
  removeColumnsFromLoading,
  setErrorForColumn,
  removeErrorForColumn,
  addColumnsToDragging,
  removeColumnsFromDragging,
  setHoveredColumns,
  appendToHoveredColumns,
  removeFromHoveredColumns,
  clearHoveredColumns,
  setColumnType,
  setSelectedColumns,
  appendToSelectedColumns,
  clearSelectedColumns,
  removeFromSelectedColumns,
  setValueCounts,
  addColumnsFromOpenRefine,
  setColumnsIndex,
  updateAttribute,
} from "./columnsSlice";
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
  describe("addColumns", () => {
    it("adds a single column", () => {
      const state = getInitialState();
      const column = Column("t1", 0, "A", COLUMN_TYPE_NUMERICAL);
      const nextState = columnsSlice(state, addColumns(column));
      expect(Object.values(nextState.data)).toHaveLength(1);
      expect(nextState.data[column.id]).toEqual(column);
      expect(nextState.idsByTable["t1"]).toContain(column.id);
    });
    it("adds multiple columns", () => {
      const state = getInitialState();
      const columns = [
        Column("t1", 0, "A", COLUMN_TYPE_NUMERICAL),
        Column("t1", 1, "B", COLUMN_TYPE_CATEGORICAL),
      ];
      const nextState = columnsSlice(state, addColumns(columns));
      expect(Object.values(nextState.data)).toHaveLength(2);
      expect(nextState.idsByTable["t1"]).toEqual([
        columns[0].id,
        columns[1].id,
      ]);
    });
    it("throws if column already exists", () => {
      const column = Column("t1", 0, "A", COLUMN_TYPE_NUMERICAL);
      const state = {
        ...getInitialState(),
        data: { [column.id]: column },
        idsByTable: { t1: [column.id] },
      };
      expect(() => columnsSlice(state, addColumns(column))).toThrow();
    });
  });

  describe("updateColumns", () => {
    it("updates a single column", () => {
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
    it("updates multiple columns", () => {
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
    it("throws if column does not exist", () => {
      const col = Column("t1", 0, "A", COLUMN_TYPE_NUMERICAL);
      const state = getInitialState();
      expect(() => columnsSlice(state, updateColumns(col))).toThrow();
    });
  });

  describe("removeColumns", () => {
    it("removes a column", () => {
      const column = Column("t1", 0, "A", COLUMN_TYPE_NUMERICAL);
      const state = {
        ...getInitialState(),
        data: { [column.id]: column },
        idsByTable: { t1: [column.id] },
      };
      const nextState = columnsSlice(state, removeColumns(column.id));
      expect(nextState.data[column.id]).toBeUndefined();
      expect(nextState.idsByTable["t1"]).not.toContain(column.id);
    });
    it("removes a column and also removes it from selected", () => {
      const col1 = Column("t1", 0, "A", COLUMN_TYPE_NUMERICAL);
      const col2 = Column("t1", 1, "B", COLUMN_TYPE_CATEGORICAL);
      const state = {
        ...getInitialState(),
        data: { [col1.id]: col1, [col2.id]: col2 },
        idsByTable: { t1: [col1.id, col2.id] },
        selected: [col1.id, col2.id],
      };
      const nextState = columnsSlice(state, removeColumns(col1.id));
      expect(nextState.data[col1.id]).toBeUndefined();
      expect(nextState.idsByTable["t1"]).not.toContain(col1.id);
      expect(nextState.selected).not.toContain(col1.id);
      expect(nextState.selected).toContain(col2.id);
    });
  });

  describe("renameColumns", () => {
    it("renames a column", () => {
      const col = Column("t1", 0, "A", COLUMN_TYPE_NUMERICAL);
      const state = {
        ...getInitialState(),
        data: { [col.id]: col },
        idsByTable: { t1: [col.id] },
      };
      const nextState = columnsSlice(
        state,
        renameColumns({ id: col.id, newColumnName: "Renamed" })
      );
      expect(nextState.data[col.id].name).toBe("Renamed");
    });
  });

  describe("addColumnsToLoading / removeColumnsFromLoading", () => {
    it("manages loading state", () => {
      const col = Column("t1", 0, "A", COLUMN_TYPE_NUMERICAL);
      let state = getInitialState();
      state = columnsSlice(state, addColumnsToLoading(col.id));
      expect(state.loading).toContain(col.id);
      state = columnsSlice(state, removeColumnsFromLoading(col.id));
      expect(state.loading).not.toContain(col.id);
    });
  });

  describe("setErrorForColumn / removeErrorForColumn", () => {
    it("manages error state", () => {
      const col = Column("t1", 0, "A", COLUMN_TYPE_NUMERICAL);
      let state = getInitialState();
      state = columnsSlice(
        state,
        setErrorForColumn({ id: col.id, error: "err" })
      );
      expect(state.errors[col.id]).toBe("err");
      state = columnsSlice(state, removeErrorForColumn({ id: col.id }));
      expect(state.errors[col.id]).toBeUndefined();
    });
  });

  describe("addColumnsToDragging / removeColumnsFromDragging", () => {
    it("manages dragging state", () => {
      const col = Column("t1", 0, "A", COLUMN_TYPE_NUMERICAL);
      let state = getInitialState();
      state = columnsSlice(state, addColumnsToDragging(col.id));
      expect(state.dragging).toContain(col.id);
      state = columnsSlice(state, removeColumnsFromDragging(col.id));
      expect(state.dragging).not.toContain(col.id);
    });
  });

  describe("setHoveredColumns / appendToHoveredColumns / removeFromHoveredColumns / clearHoveredColumns", () => {
    it("manages hovered state", () => {
      const col1 = Column("t1", 0, "A", COLUMN_TYPE_NUMERICAL);
      const col2 = Column("t1", 1, "B", COLUMN_TYPE_CATEGORICAL);
      let state = getInitialState();
      state = columnsSlice(state, setHoveredColumns(col1.id));
      expect(state.hovered).toEqual([col1.id]);
      state = columnsSlice(state, appendToHoveredColumns(col2.id));
      expect(state.hovered).toEqual([col1.id, col2.id]);
      state = columnsSlice(state, removeFromHoveredColumns(col1.id));
      expect(state.hovered).toEqual([col2.id]);
      state = columnsSlice(state, clearHoveredColumns());
      expect(state.hovered).toEqual([]);
    });
  });

  describe("setColumnType", () => {
    it("sets column type", () => {
      const col = Column("t1", 0, "A", COLUMN_TYPE_NUMERICAL);
      const state = {
        ...getInitialState(),
        data: { [col.id]: col },
        idsByTable: { t1: [col.id] },
      };
      const nextState = columnsSlice(
        state,
        setColumnType({ ids: col.id, columnTypes: COLUMN_TYPE_CATEGORICAL })
      );
      expect(nextState.data[col.id].columnType).toBe(COLUMN_TYPE_CATEGORICAL);
    });
  });

  describe("setSelectedColumns / appendToSelectedColumns / clearSelectedColumns", () => {
    it("manages selected state", () => {
      const col1 = Column("t1", 0, "A", COLUMN_TYPE_NUMERICAL);
      const col2 = Column("t1", 1, "B", COLUMN_TYPE_CATEGORICAL);
      let state = getInitialState();
      state = columnsSlice(state, setSelectedColumns(col1.id));
      expect(state.selected).toEqual([col1.id]);
      state = columnsSlice(state, appendToSelectedColumns(col2.id));
      expect(state.selected).toEqual([col1.id, col2.id]);
      state = columnsSlice(state, clearSelectedColumns());
      expect(state.selected).toEqual([]);
    });
  });

  describe("setValueCounts", () => {
    it("sets value counts for a column", () => {
      const col = Column("t1", 0, "A", COLUMN_TYPE_NUMERICAL);
      const state = {
        ...getInitialState(),
        data: { [col.id]: col },
        idsByTable: { t1: [col.id] },
      };
      const nextState = columnsSlice(
        state,
        setValueCounts({ values: ["x", "y"], counts: [1, 2], columnId: col.id })
      );
      expect(nextState.data[col.id].values["x"]).toBe(1);
      expect(nextState.data[col.id].values["y"]).toBe(2);
    });
  });

  describe("addColumnsFromOpenRefine", () => {
    it("adds columns from OpenRefine", () => {
      const payload = {
        projectId: "t1",
        columnsInfo: [
          { name: "A", is_numeric: false },
          { name: "B", is_numeric: true },
        ],
      };
      const state = getInitialState();
      const nextState = columnsSlice(state, addColumnsFromOpenRefine(payload));
      expect(Object.values(nextState.data)).toHaveLength(2);
      expect(nextState.idsByTable["t1"]).toHaveLength(2);
    });
  });

  describe("setColumnsIndex", () => {
    it("sets the index of a single column", () => {
      const col = Column("t1", 0, "A", COLUMN_TYPE_NUMERICAL);
      const state = {
        ...getInitialState(),
        data: { [col.id]: { ...col } },
        idsByTable: { t1: [col.id] },
      };
      const nextState = columnsSlice(
        state,
        setColumnsIndex({ ids: col.id, indices: 5 })
      );
      expect(nextState.data[col.id].index).toBe(5);
    });

    it("sets the indices of multiple columns", () => {
      const col1 = Column("t1", 0, "A", COLUMN_TYPE_NUMERICAL);
      const col2 = Column("t1", 1, "B", COLUMN_TYPE_CATEGORICAL);
      const state = {
        ...getInitialState(),
        data: { [col1.id]: { ...col1 }, [col2.id]: { ...col2 } },
        idsByTable: { t1: [col1.id, col2.id] },
      };
      const nextState = columnsSlice(
        state,
        setColumnsIndex({ ids: [col1.id, col2.id], indices: [2, 7] })
      );
      expect(nextState.data[col1.id].index).toBe(2);
      expect(nextState.data[col2.id].index).toBe(7);
    });

    it("throws if ids and indices length mismatch", () => {
      const col1 = Column("t1", 0, "A", COLUMN_TYPE_NUMERICAL);
      const state = {
        ...getInitialState(),
        data: { [col1.id]: { ...col1 } },
        idsByTable: { t1: [col1.id] },
      };
      expect(() =>
        columnsSlice(
          state,
          setColumnsIndex({ ids: [col1.id, "fake"], indices: [1] })
        )
      ).toThrow(/number of ids must match/);
    });

    it("throws if column id not found", () => {
      const col1 = Column("t1", 0, "A", COLUMN_TYPE_NUMERICAL);
      const state = {
        ...getInitialState(),
        data: { [col1.id]: { ...col1 } },
        idsByTable: { t1: [col1.id] },
      };
      expect(() =>
        columnsSlice(
          state,
          setColumnsIndex({ ids: [col1.id, "notfound"], indices: [1, 2] })
        )
      ).toThrow(/not found/);
    });
  });

  describe("updateAttribute", () => {
    it("updates a single attribute for a column", () => {
      const col = Column("t1", 0, "A", COLUMN_TYPE_NUMERICAL);
      const state = {
        ...getInitialState(),
        data: { [col.id]: { ...col, isRemoved: false } },
        idsByTable: { t1: [col.id] },
      };
      const nextState = columnsSlice(
        state,
        updateAttribute({ ids: col.id, attribute: "isRemoved", value: true })
      );
      expect(nextState.data[col.id].isRemoved).toBe(true);
    });

    it("updates an attribute for multiple columns", () => {
      const col1 = Column("t1", 0, "A", COLUMN_TYPE_NUMERICAL);
      const col2 = Column("t1", 1, "B", COLUMN_TYPE_CATEGORICAL);
      const state = {
        ...getInitialState(),
        data: {
          [col1.id]: { ...col1, isRemoved: false },
          [col2.id]: { ...col2, isRemoved: false },
        },
        idsByTable: { t1: [col1.id, col2.id] },
      };
      const nextState = columnsSlice(
        state,
        updateAttribute({ ids: [col1.id, col2.id], attribute: "isRemoved", value: true })
      );
      expect(nextState.data[col1.id].isRemoved).toBe(true);
      expect(nextState.data[col2.id].isRemoved).toBe(true);
    });

    it("throws if column id not found", () => {
      const col = Column("t1", 0, "A", COLUMN_TYPE_NUMERICAL);
      const state = {
        ...getInitialState(),
        data: { [col.id]: { ...col, isRemoved: false } },
        idsByTable: { t1: [col.id] },
      };
      expect(() =>
        columnsSlice(
          state,
          updateAttribute({ ids: [col.id, "notfound"], attribute: "isRemoved", value: true })
        )
      ).toThrow(/not found/);
    });

    it("throws if attribute is not present on column", () => {
      const col = Column("t1", 0, "A", COLUMN_TYPE_NUMERICAL);
      const state = {
        ...getInitialState(),
        data: { [col.id]: { ...col, isRemoved: false } },
        idsByTable: { t1: [col.id] },
      };
      expect(() =>
        columnsSlice(
          state,
          updateAttribute({ ids: col.id, attribute: "notAProp", value: 123 })
        )
      ).toThrow(/attribute 'notAProp'/);
    });

    it("throws if trying to update immutable attribute 'id'", () => {
      const col = Column("t1", 0, "A", COLUMN_TYPE_NUMERICAL);
      const state = {
        ...getInitialState(),
        data: { [col.id]: { ...col, isRemoved: false } },
        idsByTable: { t1: [col.id] },
      };
      expect(() =>
        columnsSlice(
          state,
          updateAttribute({ ids: col.id, attribute: "id", value: "newid" })
        )
      ).toThrow(/immutable/);
    });

    it("throws if trying to update immutable attribute 'tableId'", () => {
      const col = Column("t1", 0, "A", COLUMN_TYPE_NUMERICAL);
      const state = {
        ...getInitialState(),
        data: { [col.id]: { ...col, isRemoved: false } },
        idsByTable: { t1: [col.id] },
      };
      expect(() =>
        columnsSlice(
          state,
          updateAttribute({ ids: col.id, attribute: "tableId", value: "t2" })
        )
      ).toThrow(/immutable/);
    });

    it("throws if trying to update immutable attribute 'name'", () => {
      const col = Column("t1", 0, "A", COLUMN_TYPE_NUMERICAL);
      const state = {
        ...getInitialState(),
        data: { [col.id]: { ...col, isRemoved: false } },
        idsByTable: { t1: [col.id] },
      };
      expect(() =>
        columnsSlice(
          state,
          updateAttribute({ ids: col.id, attribute: "name", value: "newName" })
        )
      ).toThrow(/immutable/);
    });

    it("throws if trying to set isRemoved to non-boolean", () => {
      const col = Column("t1", 0, "A", COLUMN_TYPE_NUMERICAL);
      const state = {
        ...getInitialState(),
        data: { [col.id]: { ...col, isRemoved: false } },
        idsByTable: { t1: [col.id] },
      };
      expect(() =>
        columnsSlice(
          state,
          updateAttribute({ ids: col.id, attribute: "isRemoved", value: "yes" })
        )
      ).toThrow(/must be a boolean/);
    });

    it("throws if trying to set columnType to invalid value", () => {
      const col = Column("t1", 0, "A", COLUMN_TYPE_NUMERICAL);
      const state = {
        ...getInitialState(),
        data: { [col.id]: { ...col, isRemoved: false } },
        idsByTable: { t1: [col.id] },
      };
      expect(() =>
        columnsSlice(
          state,
          updateAttribute({ ids: col.id, attribute: "columnType", value: "notAType" })
        )
      ).toThrow();
    });
  });

});
