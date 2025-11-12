import { describe, it, expect } from "vitest";
import { expectSaga } from "redux-saga-test-plan";
import updateColumnsWorker from "./worker";
import { Column, updateColumns } from "../../slices/columnsSlice";

describe("updateColumnsWorker saga", () => {
  describe("updates via user-supplied metadata", () => {
    it("updates a single column", async () => {
      const mockColumnC1 = Column({
        name: "bar",
      });

      const action = {
        payload: {
          columnUpdates: [{ id: "c1", name: "foo" }],
        },
      };

      const { effects } = await expectSaga(updateColumnsWorker, action)
        .withState({
          columns: {
            byId: {
              col1: mockColumnC1,
            },
            allIds: [mockColumnC1.id],
          },
        })
        .run();

      // Verify updateColumns was called with correct structure
      const updateColumnsAction = effects.put.find(
        (effect) => effect.payload.action.type === updateColumns.type
      );
      const columnUpdates = updateColumnsAction.payload.action.payload;

      expect(columnUpdates).toHaveLength(1);
      expect(columnUpdates[0]).toMatchObject({
        id: mockColumnC1.id,
        name: "foo",
      });
    });

    //     it("creates multiple columns from the same table", async () => {
    //       const action = {
    //         payload: {
    //           columnInfo: [
    //             { parentId: "t1", index: 0 },
    //             { parentId: "t1", index: 1 },
    //             { parentId: "t1", index: 2 },
    //           ],
    //           mode: CREATION_MODE_INITIALIZATION,
    //         },
    //       };

    //       const mockColumnNames = ["col_a", "col_b", "col_c"];

    //       const { effects } = await expectSaga(updateColumnsWorker, action)
    //         .provide([[matchers.call.fn(getTableColumnNames), mockColumnNames]])
    //         .run();

    //       // Verify the correct number of columns were created
    //       const addColumnsAction = effects.put.find(
    //         (effect) => effect.payload.action.type === addColumnsToSlice.type
    //       );
    //       const columns = addColumnsAction.payload.action.payload;

    //       expect(columns).toHaveLength(3);
    //       expect(columns[0]).toMatchObject({
    //         parentId: "t1",
    //         databaseName: "col_a",
    //       });
    //       expect(columns[1]).toMatchObject({
    //         parentId: "t1",
    //         databaseName: "col_b",
    //       });
    //       expect(columns[2]).toMatchObject({
    //         parentId: "t1",
    //         databaseName: "col_c",
    //       });

    //       // Verify the table update contains 3 column IDs
    //       const updateTablesAction = effects.put.find(
    //         (effect) => effect.payload.action.type === updateTables.type
    //       );
    //       expect(
    //         updateTablesAction.payload.action.payload[0].columnIds
    //       ).toHaveLength(3);
    //     });

    //     it("creates columns from multiple tables and updates each table correctly", async () => {
    //       const action = {
    //         payload: {
    //           columnInfo: [
    //             { parentId: "t1", index: 0 },
    //             { parentId: "t1", index: 1 },
    //             { parentId: "t2", index: 0 },
    //             { parentId: "t3", index: 0 },
    //           ],
    //         },
    //       };

    //       const mockColumnNamesT1 = ["table1_col_a", "table1_col_b"];
    //       const mockColumnNamesT2 = ["table2_col_a"];
    //       const mockColumnNamesT3 = ["table3_col_a"];

    //       const { effects } = await expectSaga(updateColumnsWorker, action)
    //         .provide([
    //           [matchers.call(getTableColumnNames, "t1"), mockColumnNamesT1],
    //           [matchers.call(getTableColumnNames, "t2"), mockColumnNamesT2],
    //           [matchers.call(getTableColumnNames, "t3"), mockColumnNamesT3],
    //         ])
    //         .run();

    //       // Verify 4 columns were created total
    //       const addColumnsAction = effects.put.find(
    //         (effect) => effect.payload.action.type === addColumnsToSlice.type
    //       );
    //       const columns = addColumnsAction.payload.action.payload;

    //       expect(columns).toHaveLength(4);

    //       // Verify column names
    //       expect(columns[0]).toMatchObject({
    //         parentId: "t1",
    //         databaseName: "table1_col_a",
    //       });
    //       expect(columns[1]).toMatchObject({
    //         parentId: "t1",
    //         databaseName: "table1_col_b",
    //       });
    //       expect(columns[2]).toMatchObject({
    //         parentId: "t2",
    //         databaseName: "table2_col_a",
    //       });
    //       expect(columns[3]).toMatchObject({
    //         parentId: "t3",
    //         databaseName: "table3_col_a",
    //       });
    //       // Verify 3 table updates (one for each table)
    //       const updateTablesAction = effects.put.find(
    //         (effect) => effect.payload.action.type === updateTables.type
    //       );
    //       const tableUpdates = updateTablesAction.payload.action.payload;

    //       expect(tableUpdates).toHaveLength(3);

    //       // Verify t1 has 2 column IDs
    //       const t1Update = tableUpdates.find((update) => update.id === "t1");
    //       expect(t1Update.columnIds).toHaveLength(2);
    //       expect(t1Update.columnIds).toEqual([columns[0].id, columns[1].id]);

    //       // Verify t2 has 1 column ID
    //       const t2Update = tableUpdates.find((update) => update.id === "t2");
    //       expect(t2Update.columnIds).toHaveLength(1);
    //       expect(t2Update.columnIds[0]).toEqual(columns[2].id);

    //       // Verify t3 has 1 column ID
    //       const t3Update = tableUpdates.find((update) => update.id === "t3");
    //       expect(t3Update.columnIds).toHaveLength(1);
    //       expect(t3Update.columnIds[0]).toEqual(columns[3].id);
    //     });

    //     it("fetches column names from DB only once per table", async () => {
    //       const action = {
    //         payload: {
    //           columnInfo: [
    //             { parentId: "t1", index: 0 },
    //             { parentId: "t1", index: 1 },
    //             { parentId: "t1", index: 2 },
    //           ],
    //         },
    //       };

    //       const mockColumnNames = ["col_a", "col_b", "col_c"];

    //       const { effects } = await expectSaga(updateColumnsWorker, action)
    //         .provide([[matchers.call(getTableColumnNames, "t1"), mockColumnNames]])
    //         .run();

    //       // Count how many times getTableColumnNames was called with t1
    //       const getTableColumnNamesCalls = effects.call.filter(
    //         (effect) => effect.payload.args[0] === "t1"
    //       );
    //       // Should only be called once even though we're creating 3 columns
    //       expect(getTableColumnNamesCalls).toHaveLength(1);
    //     });
    //   });
  });
});
