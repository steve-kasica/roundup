import { describe, it, expect } from "vitest";
import {
  selectOperationsById,
  selectAllOperationIds,
  selectOperationIdByChildId,
  selectOperationDepthById,
  selectMaxOperationDepth,
  selectOperationQueryData,
  selectOperationChildRowCounts,
  selectStackOperationRowRanges,
} from "./selectors";
import Operation, {
  DEFAULT_JOIN_PREDICATE,
  DEFAULT_JOIN_TYPE,
  JOIN_PREDICATES,
  OPERATION_TYPE_PACK,
  OPERATION_TYPE_STACK,
} from "./Operation";
import { Table } from "../tablesSlice";
import { Column } from "../columnsSlice";

describe("operationsSelectors", () => {
  let columns = Array.from({ length: 12 }, (_, i) =>
      Column({
        databaseName: `column_${i}`,
      }),
    ),
    tables = Array.from({ length: 4 }, (_, i) =>
      Table({
        databaseName: `table_${i}`,
        rowCount: 10 * (i + 1),
      }),
    ),
    operations = Array.from({ length: 2 }, (_, i) =>
      Operation({
        databaseName: `operation_${i}`,
        ...(i === 1
          ? {
              operationType: OPERATION_TYPE_PACK,
              joinKey1: columns[6].id,
              joinKey2: columns[8].id,
              joinPredicate: DEFAULT_JOIN_PREDICATE,
              joinType: DEFAULT_JOIN_TYPE,
            }
          : {
              operationType: OPERATION_TYPE_STACK,
              joinKey1: undefined,
              joinKey2: undefined,
              joinPredicate: undefined,
              joinType: undefined,
            }),
      }),
    ),
    state;

  operations[1].childIds = [operations[0].id, tables[2].id, tables[3].id];
  operations[1].columnIds = [columns[8].id, columns[9].id];
  operations[0].childIds = [tables[0].id, tables[1].id];
  operations[0].columnIds = [columns[6].id, columns[7].id];

  operations[0].rowCount = tables[0].rowCount + tables[1].rowCount;
  operations[1].rowCount =
    operations[0].rowCount + tables[2].rowCount + tables[3].rowCount;

  operations[1].parentId = operations[0].id;
  tables[0].parentId = operations[1].id;
  tables[1].parentId = operations[1].id;
  tables[2].parentId = operations[0].id;
  tables[3].parentId = operations[1].id;

  columns[0].parentId = tables[0].id;
  columns[1].parentId = tables[0].id;
  columns[2].parentId = tables[1].id;
  columns[3].parentId = tables[1].id;
  columns[4].parentId = tables[2].id;
  columns[5].parentId = tables[2].id;
  columns[6].parentId = operations[1].id;
  columns[7].parentId = operations[1].id;
  columns[8].parentId = operations[0].id;
  columns[9].parentId = operations[0].id;
  columns[10].parentId = tables[3].id;
  columns[11].parentId = tables[3].id;

  tables[0].columnIds = [columns[0].id, columns[1].id];
  tables[1].columnIds = [columns[2].id, columns[3].id];
  tables[2].columnIds = [columns[4].id, columns[5].id];
  tables[3].columnIds = [columns[10].id, columns[11].id];

  state = {
    columns: {
      byId: Object.fromEntries(columns.map((c) => [c.id, c])),
      allIds: columns.map((c) => c.id),
    },
    tables: {
      byId: Object.fromEntries(tables.map((t) => [t.id, t])),
      allIds: tables.map((t) => t.id),
    },
    operations: {
      byId: Object.fromEntries(operations.map((o) => [o.id, o])),
      allIds: operations.map((o) => o.id),
      rootOperationId: operations[1].id,
    },
  };
  describe("selectOperationsById", () => {
    it("should return the operation for a given ID", () => {
      expect(selectOperationsById(state, operations[0].id)).toEqual(
        operations[0],
      );
    });
    it("should return an array of operations for given IDs", () => {
      expect(
        selectOperationsById(state, [operations[0].id, operations[1].id]),
      ).toEqual([operations[0], operations[1]]);
    });
  });
  describe("selectAllOperationIds", () => {
    it("should return all operation IDs", () => {
      expect(selectAllOperationIds(state)).toEqual([
        operations[0].id,
        operations[1].id,
      ]);
    });
  });
  describe("selectOperationIdByChildId", () => {
    it("should return the operation ID for a given table ID", () => {
      expect(selectOperationIdByChildId(state, tables[0].id)).toEqual(
        operations[0].id,
      );
    });
    it("should return undefined if no operation contains the table ID", () => {
      expect(selectOperationIdByChildId(state, "t100")).toBeUndefined();
    });
    it("should return the operation ID for a given operation ID", () => {
      expect(selectOperationIdByChildId(state, operations[0].id)).toEqual(
        operations[1].id,
      );
    });
    it("should return an array of operation IDs for given child IDs", () => {
      expect(
        selectOperationIdByChildId(state, [tables[0].id, operations[0].id]),
      ).toEqual([operations[0].id, operations[1].id]);
    });
    it("should return undefined for child IDs not contained in any operation", () => {
      expect(selectOperationIdByChildId(state, ["t100", "o100"])).toEqual([
        undefined,
        undefined,
      ]);
    });
  });
  describe("selectOperationDepthByIdById", () => {
    it("should return the depth of the operation in the tree", () => {
      // Assuming root operation has depth 0
      expect(selectOperationDepthById(state, operations[1].id)).toEqual(0);
      expect(selectOperationDepthById(state, operations[0].id)).toEqual(1);
    });
  });
  describe("selectMaxOperationDepth", () => {
    it("should return the maximum depth of the operation tree", () => {
      expect(selectMaxOperationDepth(state)).toEqual(2);
    });
  });
  describe("selectOperationQueryData", () => {
    it("should return the query data for a given composite operation", () => {
      expect(
        selectOperationQueryData(state, state.operations.rootOperationId),
      ).toEqual({
        viewName: operations[1].databaseName,
        columnNames: operations[1].columnIds.map(
          (id) => state.columns.byId[id].databaseName,
        ),
        leftKey: columns[6].databaseName,
        rightKey: columns[8].databaseName,
        joinPredicate: JOIN_PREDICATES.EQUALS,
        joinType: operations[1].joinType,
        children: [
          {
            tableName: operations[0].databaseName,
            columnNames: operations[0].columnIds.map(
              (id) => state.columns.byId[id].databaseName,
            ),
          },
          {
            tableName: tables[2].databaseName,
            columnNames: tables[2].columnIds.map(
              (id) => state.columns.byId[id].databaseName,
            ),
          },
          {
            tableName: tables[3].databaseName,
            columnNames: tables[3].columnIds.map(
              (id) => state.columns.byId[id].databaseName,
            ),
          },
        ],
      });
    });
  });
  describe("selectOperationChildRowCounts", () => {
    it("should return the row counts of child tables/operations", () => {
      expect(selectOperationChildRowCounts(state, operations[1].id)).toEqual(
        new Map([
          [operations[0].id, operations[0].rowCount],
          [tables[2].id, tables[2].rowCount],
          [tables[3].id, tables[3].rowCount],
        ]),
      );
    });
  });
  describe("selectStackOperationRowRanges", () => {
    it("should return the row ranges of child tables/operations in a stack operation", () => {
      const expected = new Map();
      expected.set(operations[0].id, {
        start: 0,
        end: 29,
      });
      expected.set(tables[2].id, {
        start: 30,
        end: 29 + 30,
      });
      expected.set(tables[3].id, {
        start: 29 + 30 + 1,
        end: operations[1].rowCount - 1,
      });

      const actual = selectStackOperationRowRanges(state, operations[1].id);

      expect(actual).toEqual(expected);
    });
  });
});
