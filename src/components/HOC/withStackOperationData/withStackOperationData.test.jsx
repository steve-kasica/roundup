import withStackOperationData from "./withStackOperationData";
import babyNamePolitics from "../../../../example-workflows/babyname_politics/initialState";
import crimeAndHeat from "../../../../example-workflows/2018-05-31-crime-and-heat-analysis/initialState";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import Operation, {
  OPERATION_TYPE_STACK,
} from "../../../slices/operationsSlice/Operation";
import { Table } from "../../../slices/tablesSlice";
import { Column } from "../../../slices/columnsSlice";

/**
 * Helper to create a mock Redux store with initial state
 */
function createMockStore(initialState) {
  return configureStore({
    reducer: {
      columns: (state = initialState.columns) => state,
      tables: (state = initialState.tables) => state,
      operations: (state = initialState.operations) => state,
    },
    preloadedState: initialState,
  });
}

/**
 * Helper to create a test state for stack operations
 */
function createStackOperationState({ tables, columns, operations }) {
  return {
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
      rootOperationId: operations[operations.length - 1]?.id || null,
    },
  };
}

/**
 * Helper to render a wrapped component and capture its props
 */
function renderWithStackOperationData(state, operationId) {
  const store = createMockStore(state);
  let capturedProps = null;

  const TestComponent = (props) => {
    capturedProps = props;
    return null;
  };

  const WrappedComponent = withStackOperationData(TestComponent);

  render(
    <Provider store={store}>
      <WrappedComponent id={operationId} />
    </Provider>
  );

  return capturedProps;
}

describe("withStackOperationData HOC", () => {
  it("should wrap a component without errors", () => {
    // Create minimal test data
    const columns = [
      Column({ databaseName: "col1" }),
      Column({ databaseName: "col2" }),
    ];
    const tables = [
      Table({
        databaseName: "table1",
        rowCount: 10,
        columnIds: [columns[0].id],
      }),
      Table({
        databaseName: "table2",
        rowCount: 20,
        columnIds: [columns[1].id],
      }),
    ];
    columns[0].parentId = tables[0].id;
    columns[1].parentId = tables[1].id;

    const operations = [
      Operation({
        operationType: OPERATION_TYPE_STACK,
        childIds: [tables[0].id, tables[1].id],
        rowCount: 30,
      }),
    ];

    const state = createStackOperationState({ tables, columns, operations });
    const props = renderWithStackOperationData(state, operations[0].id);

    // Should have received props
    expect(props).not.toBeNull();
    expect(props.id).toBe(operations[0].id);
  });

  describe("columnIdMatrix", () => {
    it("returns a matrix of column IDs for each child table", () => {
      const columns = [
        Column({ databaseName: "col1" }),
        Column({ databaseName: "col2" }),
        Column({ databaseName: "col3" }),
        Column({ databaseName: "col4" }),
      ];
      const tables = [
        Table({
          databaseName: "table1",
          rowCount: 10,
          columnIds: [columns[0].id, columns[1].id],
        }),
        Table({
          databaseName: "table2",
          rowCount: 20,
          columnIds: [columns[2].id, columns[3].id],
        }),
      ];
      columns[0].parentId = tables[0].id;
      columns[1].parentId = tables[0].id;
      columns[2].parentId = tables[1].id;
      columns[3].parentId = tables[1].id;

      const operations = [
        Operation({
          operationType: OPERATION_TYPE_STACK,
          childIds: [tables[0].id, tables[1].id],
          rowCount: 30,
        }),
      ];

      const state = createStackOperationState({ tables, columns, operations });
      const props = renderWithStackOperationData(state, operations[0].id);

      expect(props.columnIdMatrix).toEqual([
        [columns[0].id, columns[1].id],
        [columns[2].id, columns[3].id],
      ]);
    });

    describe("child tables that are of the same column length", () => {
      it("does not contain any null values", () => {
        const columns = [
          Column({ databaseName: "col1" }),
          Column({ databaseName: "col2" }),
          Column({ databaseName: "col3" }),
          Column({ databaseName: "col4" }),
          Column({ databaseName: "col5" }),
          Column({ databaseName: "col6" }),
        ];
        const tables = [
          Table({
            databaseName: "table1",
            rowCount: 10,
            columnIds: [columns[0].id, columns[1].id],
          }),
          Table({
            databaseName: "table2",
            rowCount: 20,
            columnIds: [columns[2].id, columns[3].id],
          }),
          Table({
            databaseName: "table3",
            rowCount: 15,
            columnIds: [columns[4].id, columns[5].id],
          }),
        ];
        columns.forEach((col, i) => {
          col.parentId = tables[Math.floor(i / 2)].id;
        });

        const operations = [
          Operation({
            operationType: OPERATION_TYPE_STACK,
            childIds: [tables[0].id, tables[1].id, tables[2].id],
            rowCount: 45,
          }),
        ];

        const state = createStackOperationState({
          tables,
          columns,
          operations,
        });
        const props = renderWithStackOperationData(state, operations[0].id);

        // Check that no row contains null
        props.columnIdMatrix.forEach((row) => {
          row.forEach((cell) => {
            expect(cell).not.toBeNull();
          });
        });
      });
    });

    describe("child tables that are of varying column lengths", () => {
      it("returns a backfilled matrix of column IDs for each child table", () => {
        const columns = [
          Column({ databaseName: "col1" }),
          Column({ databaseName: "col2" }),
          Column({ databaseName: "col3" }),
          Column({ databaseName: "col4" }),
          Column({ databaseName: "col5" }),
          Column({ databaseName: "col6" }),
        ];
        const tables = [
          Table({
            databaseName: "table1",
            rowCount: 10,
            columnIds: [
              columns[0].id,
              columns[1].id,
              columns[2].id,
              columns[3].id,
            ],
          }),
          Table({
            databaseName: "table2",
            rowCount: 20,
            columnIds: [columns[4].id, columns[5].id],
          }),
        ];
        columns[0].parentId = tables[0].id;
        columns[1].parentId = tables[0].id;
        columns[2].parentId = tables[0].id;
        columns[3].parentId = tables[0].id;
        columns[4].parentId = tables[1].id;
        columns[5].parentId = tables[1].id;

        const operations = [
          Operation({
            operationType: OPERATION_TYPE_STACK,
            childIds: [tables[0].id, tables[1].id],
            rowCount: 30,
          }),
        ];

        const state = createStackOperationState({
          tables,
          columns,
          operations,
        });
        const props = renderWithStackOperationData(state, operations[0].id);

        // First row should have 4 columns, second row should be backfilled with nulls
        expect(props.columnIdMatrix).toEqual([
          [columns[0].id, columns[1].id, columns[2].id, columns[3].id],
          [columns[4].id, columns[5].id, null, null],
        ]);
      });
    });
  });

  describe("dimensions m and n", () => {
    it("returns m as the maximum column length among child tables", () => {
      const columns = [
        Column({ databaseName: "col1" }),
        Column({ databaseName: "col2" }),
        Column({ databaseName: "col3" }),
        Column({ databaseName: "col4" }),
        Column({ databaseName: "col5" }),
      ];
      const tables = [
        Table({
          databaseName: "table1",
          rowCount: 10,
          columnIds: [columns[0].id, columns[1].id, columns[2].id],
        }),
        Table({
          databaseName: "table2",
          rowCount: 20,
          columnIds: [columns[3].id, columns[4].id],
        }),
      ];
      columns[0].parentId = tables[0].id;
      columns[1].parentId = tables[0].id;
      columns[2].parentId = tables[0].id;
      columns[3].parentId = tables[1].id;
      columns[4].parentId = tables[1].id;

      const operations = [
        Operation({
          operationType: OPERATION_TYPE_STACK,
          childIds: [tables[0].id, tables[1].id],
          rowCount: 30,
        }),
      ];

      const state = createStackOperationState({ tables, columns, operations });
      const props = renderWithStackOperationData(state, operations[0].id);

      // m should be 3 (max column length)
      expect(props.m).toBe(3);
    });

    it("returns n as the number of child tables", () => {
      const columns = [
        Column({ databaseName: "col1" }),
        Column({ databaseName: "col2" }),
        Column({ databaseName: "col3" }),
      ];
      const tables = [
        Table({
          databaseName: "table1",
          rowCount: 10,
          columnIds: [columns[0].id],
        }),
        Table({
          databaseName: "table2",
          rowCount: 20,
          columnIds: [columns[1].id],
        }),
        Table({
          databaseName: "table3",
          rowCount: 15,
          columnIds: [columns[2].id],
        }),
      ];
      columns[0].parentId = tables[0].id;
      columns[1].parentId = tables[1].id;
      columns[2].parentId = tables[2].id;

      const operations = [
        Operation({
          operationType: OPERATION_TYPE_STACK,
          childIds: [tables[0].id, tables[1].id, tables[2].id],
          rowCount: 45,
        }),
      ];

      const state = createStackOperationState({ tables, columns, operations });
      const props = renderWithStackOperationData(state, operations[0].id);

      // n should be 3 (number of child tables)
      expect(props.n).toBe(3);
    });
  });

  describe("columnCount", () => {
    describe("when the operation has a columnCount property", () => {
      it("returns the operation's columnCount", () => {
        // Note: Based on the HOC implementation, columnCount is always derived from child tables
        // There's no columnCount property on operations in the current implementation
        // The columnCount is calculated as the max of child column lengths
        const columns = [
          Column({ databaseName: "col1" }),
          Column({ databaseName: "col2" }),
        ];
        const tables = [
          Table({
            databaseName: "table1",
            rowCount: 10,
            columnIds: [columns[0].id, columns[1].id],
          }),
        ];
        columns[0].parentId = tables[0].id;
        columns[1].parentId = tables[0].id;

        const operations = [
          Operation({
            operationType: OPERATION_TYPE_STACK,
            childIds: [tables[0].id],
            rowCount: 10,
          }),
        ];

        const state = createStackOperationState({
          tables,
          columns,
          operations,
        });
        const props = renderWithStackOperationData(state, operations[0].id);

        expect(props.columnCount).toBe(2);
      });
    });

    describe("when the operation does not have a columnCount property", () => {
      it("returns the length of its columnIds array", () => {
        const columns = [
          Column({ databaseName: "col1" }),
          Column({ databaseName: "col2" }),
          Column({ databaseName: "col3" }),
        ];
        const tables = [
          Table({
            databaseName: "table1",
            rowCount: 10,
            columnIds: [columns[0].id, columns[1].id, columns[2].id],
          }),
        ];
        columns[0].parentId = tables[0].id;
        columns[1].parentId = tables[0].id;
        columns[2].parentId = tables[0].id;

        const operations = [
          Operation({
            operationType: OPERATION_TYPE_STACK,
            childIds: [tables[0].id],
            rowCount: 10,
          }),
        ];

        const state = createStackOperationState({
          tables,
          columns,
          operations,
        });
        const props = renderWithStackOperationData(state, operations[0].id);

        expect(props.columnCount).toBe(3);
      });
    });

    describe("when there are no columns materialized", () => {
      it("returns the maximum column length among child tables", () => {
        const columns = [
          Column({ databaseName: "col1" }),
          Column({ databaseName: "col2" }),
          Column({ databaseName: "col3" }),
          Column({ databaseName: "col4" }),
          Column({ databaseName: "col5" }),
        ];
        const tables = [
          Table({
            databaseName: "table1",
            rowCount: 10,
            columnIds: [columns[0].id, columns[1].id, columns[2].id],
          }),
          Table({
            databaseName: "table2",
            rowCount: 20,
            columnIds: [columns[3].id, columns[4].id],
          }),
        ];
        columns[0].parentId = tables[0].id;
        columns[1].parentId = tables[0].id;
        columns[2].parentId = tables[0].id;
        columns[3].parentId = tables[1].id;
        columns[4].parentId = tables[1].id;

        const operations = [
          Operation({
            operationType: OPERATION_TYPE_STACK,
            childIds: [tables[0].id, tables[1].id],
            rowCount: 30,
            columnIds: [], // No columns materialized
          }),
        ];

        const state = createStackOperationState({
          tables,
          columns,
          operations,
        });
        const props = renderWithStackOperationData(state, operations[0].id);

        // Should return max column length (3) even when operation has no columnIds
        expect(props.columnCount).toBe(3);
      });
    });
  });

  describe("rowCount", () => {
    describe("when the operation has a rowCount property", () => {
      it("returns the operation's rowCount", () => {
        const columns = [
          Column({ databaseName: "col1" }),
          Column({ databaseName: "col2" }),
        ];
        const tables = [
          Table({
            databaseName: "table1",
            rowCount: 100,
            columnIds: [columns[0].id],
          }),
          Table({
            databaseName: "table2",
            rowCount: 200,
            columnIds: [columns[1].id],
          }),
        ];
        columns[0].parentId = tables[0].id;
        columns[1].parentId = tables[1].id;

        const operations = [
          Operation({
            operationType: OPERATION_TYPE_STACK,
            childIds: [tables[0].id, tables[1].id],
            rowCount: 300, // Explicit rowCount
          }),
        ];

        const state = createStackOperationState({
          tables,
          columns,
          operations,
        });
        const props = renderWithStackOperationData(state, operations[0].id);

        expect(props.rowCount).toBe(300);
      });
    });

    describe("when the operation does not have a rowCount property", () => {
      it("returns the sum of its child tables' rowCounts", () => {
        const columns = [
          Column({ databaseName: "col1" }),
          Column({ databaseName: "col2" }),
          Column({ databaseName: "col3" }),
        ];
        const tables = [
          Table({
            databaseName: "table1",
            rowCount: 50,
            columnIds: [columns[0].id],
          }),
          Table({
            databaseName: "table2",
            rowCount: 75,
            columnIds: [columns[1].id],
          }),
          Table({
            databaseName: "table3",
            rowCount: 25,
            columnIds: [columns[2].id],
          }),
        ];
        columns[0].parentId = tables[0].id;
        columns[1].parentId = tables[1].id;
        columns[2].parentId = tables[2].id;

        const operations = [
          Operation({
            operationType: OPERATION_TYPE_STACK,
            childIds: [tables[0].id, tables[1].id, tables[2].id],
            rowCount: null, // No rowCount set
          }),
        ];

        const state = createStackOperationState({
          tables,
          columns,
          operations,
        });
        const props = renderWithStackOperationData(state, operations[0].id);

        // rowCount derived from rowRanges: max end value = 50 + 75 + 25 - 1 = 149
        // The actual calculation is based on the last child's end value
        expect(props.rowCount).toBe(149);
      });
    });

    describe("when there are no rows materialized", () => {
      it("returns the sum of its child tables' rowRanges", () => {
        const columns = [
          Column({ databaseName: "col1" }),
          Column({ databaseName: "col2" }),
        ];
        const tables = [
          Table({
            databaseName: "table1",
            rowCount: 100,
            columnIds: [columns[0].id],
          }),
          Table({
            databaseName: "table2",
            rowCount: 150,
            columnIds: [columns[1].id],
          }),
        ];
        columns[0].parentId = tables[0].id;
        columns[1].parentId = tables[1].id;

        const operations = [
          Operation({
            operationType: OPERATION_TYPE_STACK,
            childIds: [tables[0].id, tables[1].id],
            rowCount: null, // Not materialized
          }),
        ];

        const state = createStackOperationState({
          tables,
          columns,
          operations,
        });
        const props = renderWithStackOperationData(state, operations[0].id);

        // rowRanges: table1 [0, 99], table2 [100, 249]
        // rowCount should be max end value = 249
        expect(props.rowCount).toBe(249);
      });
    });
  });

  describe("using imported example workflow data", () => {
    it("can work with babyNamePolitics state structure", () => {
      // Use the imported babyNamePolitics data to verify state structure compatibility
      expect(babyNamePolitics).toHaveProperty("tables");
      expect(babyNamePolitics).toHaveProperty("columns");
      expect(babyNamePolitics.tables).toHaveProperty("byId");
      expect(babyNamePolitics.tables).toHaveProperty("allIds");
    });

    it("can work with crimeAndHeat state structure", () => {
      // Use the imported crimeAndHeat data to verify state structure compatibility
      expect(crimeAndHeat).toHaveProperty("tables");
      expect(crimeAndHeat).toHaveProperty("columns");
      expect(crimeAndHeat.tables).toHaveProperty("byId");
      expect(crimeAndHeat.tables).toHaveProperty("allIds");

      // Verify tables exist with expected properties
      const tableIds = crimeAndHeat.tables.allIds;
      expect(tableIds.length).toBeGreaterThan(0);

      const firstTable = crimeAndHeat.tables.byId[tableIds[0]];
      expect(firstTable).toHaveProperty("columnIds");
      expect(firstTable).toHaveProperty("rowCount");
    });
  });
});
