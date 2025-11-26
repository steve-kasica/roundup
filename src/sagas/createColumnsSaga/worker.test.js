import { describe, it, expect } from "vitest";
import { expectSaga } from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";
import createColumnsWorker from "./worker";
import { addColumns as addColumnsToSlice } from "../../slices/columnsSlice";
import { updateTables } from "../../slices/tablesSlice";
import { createColumnsSuccess } from "./actions";
import { getTableColumnNames } from "../../lib/duckdb/getTableColumnNames";
import { CREATION_MODE_INITIALIZATION } from ".";
import { updateTablesRequest } from "../updateTablesSaga";

describe("createColumnsWorker saga", () => {
  describe("successful column creation", () => {
    it("creates a single column and updates both columns and tables slices", async () => {
      const action = {
        payload: {
          columnLocations: [
            { parentId: "t1", parentDatabaseName: "foo", index: 0 },
          ],
        },
      };

      const mockColumnNames = ["column_a", "column_b", "column_c"];

      const { effects } = await expectSaga(createColumnsWorker, action)
        .provide([[matchers.call.fn(getTableColumnNames), mockColumnNames]])
        .run();

      // Verify addColumns was called with correct structure
      const addColumnsAction = effects.put.find(
        (effect) => effect.payload.action.type === addColumnsToSlice.type
      );
      const columns = addColumnsAction.payload.action.payload;

      expect(columns).toHaveLength(1);
      expect(columns[0]).toMatchObject({
        parentId: "t1",
        databaseName: "column_a",
      });

      // Verify updateTables was called with correct structure
      const updateTablesAction = effects.put.find(
        (effect) => effect.payload.action.type === updateTablesRequest.type
      );
      console.log(updateTablesAction);
      expect(
        updateTablesAction.payload.action.payload.tableUpdates
      ).toHaveLength(1);
      expect(updateTablesAction.payload.action.payload.tableUpdates[0].id).toBe(
        "t1"
      );

      // Verify success action was called
      const successAction = effects.put.find(
        (effect) => effect.payload.action.type === createColumnsSuccess.type
      );
      expect(successAction).toBeDefined();
    });

    it("creates multiple columns from the same table", async () => {
      const action = {
        payload: {
          columnLocations: [
            { parentId: "t1", databaseName: "foo", index: 0 },
            { parentId: "t1", databaseName: "foo", index: 1 },
            { parentId: "t1", databasename: "foo", index: 2 },
          ],
        },
      };

      const mockColumnNames = ["col_a", "col_b", "col_c"];

      const { effects } = await expectSaga(createColumnsWorker, action)
        .provide([[matchers.call.fn(getTableColumnNames), mockColumnNames]])
        .run();

      // Verify the correct number of columns were created
      const addColumnsAction = effects.put.find(
        (effect) => effect.payload.action.type === addColumnsToSlice.type
      );
      const columns = addColumnsAction.payload.action.payload;

      expect(columns).toHaveLength(3);
      expect(columns[0]).toMatchObject({
        parentId: "t1",
        databaseName: "col_a",
      });
      expect(columns[1]).toMatchObject({
        parentId: "t1",
        databaseName: "col_b",
      });
      expect(columns[2]).toMatchObject({
        parentId: "t1",
        databaseName: "col_c",
      });

      // Verify the table update contains 3 column IDs
      const updateTablesAction = effects.put.find(
        (effect) => effect.payload.action.type === updateTablesRequest.type
      );
      expect(
        updateTablesAction.payload.action.payload.tableUpdates[0].columnIds
      ).toHaveLength(3);
    });

    it("creates columns from multiple tables and updates each table correctly", async () => {
      const action = {
        payload: {
          columnLocations: [
            { parentId: "t1", parentDatabaseName: "foo", index: 0 },
            { parentId: "t1", parentDatabaseName: "foo", index: 1 },
            { parentId: "t2", parentDatabaseName: "bar", index: 0 },
            { parentId: "t3", parentDatabaseName: "baz", index: 0 },
          ],
        },
      };

      const mockColumnNamesT1 = ["table1_col_a", "table1_col_b"];
      const mockColumnNamesT2 = ["table2_col_a"];
      const mockColumnNamesT3 = ["table3_col_a"];

      const { effects } = await expectSaga(createColumnsWorker, action)
        .provide([
          [matchers.call(getTableColumnNames, "foo"), mockColumnNamesT1],
          [matchers.call(getTableColumnNames, "bar"), mockColumnNamesT2],
          [matchers.call(getTableColumnNames, "baz"), mockColumnNamesT3],
        ])
        .run();

      // Verify 4 columns were created total
      const addColumnsAction = effects.put.find(
        (effect) => effect.payload.action.type === addColumnsToSlice.type
      );
      const columns = addColumnsAction.payload.action.payload;

      expect(columns).toHaveLength(4);

      // Verify column names
      expect(columns[0]).toMatchObject({
        parentId: "t1",
        databaseName: "table1_col_a",
      });
      expect(columns[1]).toMatchObject({
        parentId: "t1",
        databaseName: "table1_col_b",
      });
      expect(columns[2]).toMatchObject({
        parentId: "t2",
        databaseName: "table2_col_a",
      });
      expect(columns[3]).toMatchObject({
        parentId: "t3",
        databaseName: "table3_col_a",
      });
      // Verify 3 table updates (one for each table)
      const updateTablesAction = effects.put.find(
        (effect) => effect.payload.action.type === updateTablesRequest.type
      );
      const tableUpdates =
        updateTablesAction.payload.action.payload.tableUpdates;

      expect(tableUpdates).toHaveLength(3);

      // Verify t1 has 2 column IDs
      const t1Update = tableUpdates.find((update) => update.id === "t1");
      expect(t1Update.columnIds).toHaveLength(2);
      expect(t1Update.columnIds).toEqual([columns[0].id, columns[1].id]);

      // Verify t2 has 1 column ID
      const t2Update = tableUpdates.find((update) => update.id === "t2");
      expect(t2Update.columnIds).toHaveLength(1);
      expect(t2Update.columnIds[0]).toEqual(columns[2].id);

      // Verify t3 has 1 column ID
      const t3Update = tableUpdates.find((update) => update.id === "t3");
      expect(t3Update.columnIds).toHaveLength(1);
      expect(t3Update.columnIds[0]).toEqual(columns[3].id);
    });

    it("fetches column names from DB only once per table", async () => {
      const action = {
        payload: {
          columnLocations: [
            { parentId: "t1", databaseName: "foo", index: 0 },
            { parentId: "t1", databaseName: "foo", index: 1 },
            { parentId: "t1", databaseName: "foo", index: 2 },
          ],
        },
      };

      const mockColumnNames = ["col_a", "col_b", "col_c"];

      const { effects } = await expectSaga(createColumnsWorker, action)
        .provide([[matchers.call.fn(getTableColumnNames), mockColumnNames]])
        .run();

      // Count how many times getTableColumnNames was called with foo
      const getTableColumnNamesCalls = effects.call.filter(
        (effect) => effect.payload.fn === getTableColumnNames
      );
      // Should only be called once even though we're creating 3 columns
      expect(getTableColumnNamesCalls).toHaveLength(1);
    });
  });
});
