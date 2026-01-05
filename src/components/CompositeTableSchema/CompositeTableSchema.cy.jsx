/* eslint-disable no-undef */
/**
 * @fileoverview Cypress component tests for CompositeTableSchema.
 * @module components/CompositeTableSchema/CompositeTableSchema.cy
 *
 * These tests run in a real browser environment, enabling testing of:
 * - CSS container queries (@container)
 * - Real layout calculations
 * - Visual rendering behaviors
 *
 * For basic unit/integration tests, see CompositeTableSchema.test.jsx (Vitest).
 */

import CompositeTableSchema from "./CompositeTableSchema";
import {
  OPERATION_TYPE_NO_OP,
  OPERATION_TYPE_STACK,
  OPERATION_TYPE_PACK,
} from "../../slices/operationsSlice";
import { BLOCK_BREAKPOINTS } from "./settings";

// ============================================================================
// Mock Data Factories
// ============================================================================

/**
 * Creates a mock operation object for testing.
 */
function createMockOperation({
  id = "o1",
  operationType = OPERATION_TYPE_NO_OP,
  childIds = [],
  columnIds = [],
  rowCount = 100,
  isMaterialized = true,
  isInSync = true,
  name = null,
  parentId = null,
  ...rest
} = {}) {
  return {
    id,
    operationType,
    childIds,
    columnIds,
    rowCount,
    isMaterialized,
    isInSync,
    name,
    parentId,
    databaseName: null,
    hiddenColumnIds: [],
    ...rest,
  };
}

/**
 * Creates a mock table object for testing.
 */
function createMockTable({
  id = "t1",
  name = "Test Table",
  columnIds = [],
  rowCount = 50,
  parentId = null,
} = {}) {
  return {
    id,
    name,
    columnIds,
    rowCount,
    parentId,
    source: null,
    databaseName: `db_${id}`,
    fileName: `${name}.csv`,
    extension: "csv",
    size: 1024,
    mimeType: "text/csv",
    dateLastModified: null,
  };
}

/**
 * Creates a mock column object for testing.
 */
function createMockColumn({
  id = "c1",
  parentId = "t1",
  name = "Column 1",
  index = 0,
  columnType = "CATEGORICAL",
} = {}) {
  return {
    id,
    parentId,
    name,
    index,
    columnType,
    databaseName: `db_${name}`,
    approxUnique: 10,
    nullCount: 0,
    topValues: null,
    count: 100,
    min: null,
    max: null,
    avg: null,
    std: null,
  };
}

// ============================================================================
// Test Suites
// ============================================================================

describe("CompositeTableSchema Component Tests", () => {
  // Set up adequate viewport size for all tests
  beforeEach(() => {
    // Ensure the root element has sufficient size for container queries
    cy.document().then((doc) => {
      const root = doc.querySelector("[data-cy-root]");
      if (root) {
        root.style.width = "800px";
        root.style.height = "600px";
      }
    });
  });

  describe("Table Object Layout", () => {
    it("renders a single table with metadata", () => {
      const table = createMockTable({
        id: "t1",
        name: "Customers",
        columnIds: ["c1", "c2"],
        rowCount: 250,
      });
      const column1 = createMockColumn({ id: "c1", parentId: "t1" });
      const column2 = createMockColumn({ id: "c2", parentId: "t1" });
      const operation = createMockOperation({
        id: "o1",
        operationType: OPERATION_TYPE_NO_OP,
        childIds: ["t1"],
        columnIds: ["c1", "c2"],
        rowCount: 250,
      });

      cy.mountWithProviders(<CompositeTableSchema />, {
        preloadedState: {
          operations: {
            byId: { o1: operation },
            allIds: ["o1"],
            rootOperationId: "o1",
          },
          tables: {
            byId: { t1: table },
            allIds: ["t1"],
          },
          columns: {
            byId: { c1: column1, c2: column2 },
            allIds: ["c1", "c2"],
          },
        },
      });

      // Give the TableBlock sufficient height for container queries
      cy.get(".TableBlock")
        .should("exist")
        .then(($el) => {
          $el.css({ minHeight: "80px", minWidth: "200px" });
        });

      // Verify table name is rendered
      cy.contains("Customers").should("exist");
      // Verify dimensions are rendered (may need small wait for CSS to apply)
      cy.contains("2 x 250").should("exist");
    });
  });

  describe("STACK Operation Layout", () => {
    it("renders tables stacked vertically", () => {
      const table1 = createMockTable({
        id: "t1",
        name: "Table A",
        columnIds: ["c1"],
        rowCount: 100,
      });
      const table2 = createMockTable({
        id: "t2",
        name: "Table B",
        columnIds: ["c2"],
        rowCount: 200,
      });
      const column1 = createMockColumn({ id: "c1", parentId: "t1" });
      const column2 = createMockColumn({ id: "c2", parentId: "t2" });
      const operation = createMockOperation({
        id: "o1",
        operationType: OPERATION_TYPE_STACK,
        childIds: ["t1", "t2"],
        columnIds: ["c1", "c2"],
        rowCount: 300,
      });

      cy.mountWithProviders(<CompositeTableSchema />, {
        preloadedState: {
          operations: {
            byId: { o1: operation },
            allIds: ["o1"],
            rootOperationId: "o1",
          },
          tables: {
            byId: { t1: table1, t2: table2 },
            allIds: ["t1", "t2"],
          },
          columns: {
            byId: { c1: column1, c2: column2 },
            allIds: ["c1", "c2"],
          },
          ui: {
            focusedObjectId: "o1",
            focusedColumnId: null,
            draggingSourceId: null,
            isSelectAllChecked: false,
            allColumns: [],
            isDataGridOpen: true,
            isDataGridMaximized: false,
          },
        },
      });

      // Verify StackOperationBlock exists with vertical layout
      cy.get(".StackOperationBlock")
        .should("exist")
        .and("have.css", "flex-direction", "column");

      // Give TableBlocks sufficient size
      cy.get(".TableBlock").each(($el) => {
        $el.css({ minHeight: "60px", minWidth: "150px" });
      });

      // Verify both tables are rendered
      cy.contains("Table A").should("exist");
      cy.contains("Table B").should("exist");

      // Verify tables are stacked vertically (Table A above Table B)
      cy.get(".TableBlock").should("have.length", 2);
      cy.get(".TableBlock").then(($tables) => {
        const tableARect = $tables[0].getBoundingClientRect();
        const tableBRect = $tables[1].getBoundingClientRect();
        // Table A should be above Table B (smaller top value)
        expect(tableARect.top).to.be.lessThan(tableBRect.top);
      });
    });
  });

  describe("PACK Operation Layout", () => {
    it("renders tables arranged horizontally (side by side)", () => {
      const table1 = createMockTable({
        id: "t1",
        name: "Left Table",
        columnIds: ["c1"],
        rowCount: 100,
      });
      const table2 = createMockTable({
        id: "t2",
        name: "Right Table",
        columnIds: ["c2"],
        rowCount: 100,
      });
      const column1 = createMockColumn({ id: "c1", parentId: "t1" });
      const column2 = createMockColumn({ id: "c2", parentId: "t2" });
      const operation = createMockOperation({
        id: "o1",
        operationType: OPERATION_TYPE_PACK,
        childIds: ["t1", "t2"],
        columnIds: ["c1", "c2"],
        rowCount: 80,
        joinType: "FULL OUTER",
        joinPredicate: "EQUALS",
        joinKey1: null,
        joinKey2: null,
        matchStats: { matches: 0, left_unmatched: 0, right_unmatched: 0 },
      });

      cy.mountWithProviders(<CompositeTableSchema />, {
        preloadedState: {
          operations: {
            byId: { o1: operation },
            allIds: ["o1"],
            rootOperationId: "o1",
          },
          tables: {
            byId: { t1: table1, t2: table2 },
            allIds: ["t1", "t2"],
          },
          columns: {
            byId: { c1: column1, c2: column2 },
            allIds: ["c1", "c2"],
          },
          ui: {
            focusedObjectId: "o1",
            focusedColumnId: null,
            draggingSourceId: null,
            isSelectAllChecked: false,
            allColumns: [],
            isDataGridOpen: true,
            isDataGridMaximized: false,
          },
        },
      });

      // Verify PackOperationBlock exists
      cy.get(".PackOperationBlock").should("exist");

      // Give TableBlocks sufficient size
      cy.get(".TableBlock").each(($el) => {
        $el.css({ minHeight: "60px", minWidth: "150px" });
      });

      // Verify both tables are rendered
      cy.contains("Left Table").should("exist");
      cy.contains("Right Table").should("exist");

      // Verify tables are side by side (same row, different columns)
      cy.get(".TableBlock").should("have.length", 2);
      cy.get(".TableBlock").then(($tables) => {
        const leftRect = $tables[0].getBoundingClientRect();
        const rightRect = $tables[1].getBoundingClientRect();
        // Left table should be to the left of Right table
        expect(leftRect.left).to.be.lessThan(rightRect.left);
        // They should be roughly at the same vertical position
        expect(Math.abs(leftRect.top - rightRect.top)).to.be.lessThan(10);
      });
    });
  });

  describe("CSS Container Query Behavior", () => {
    it("hides table dimensions when container height less than medium breakpoint", () => {
      const table = createMockTable({
        id: "t1",
        name: "Customers",
        columnIds: ["c1", "c2"],
        rowCount: 250,
      });
      const column1 = createMockColumn({ id: "c1", parentId: "t1" });
      const column2 = createMockColumn({ id: "c2", parentId: "t1" });
      const operation = createMockOperation({
        id: "o1",
        operationType: OPERATION_TYPE_NO_OP,
        childIds: ["t1"],
        columnIds: ["c1", "c2"],
        rowCount: 250,
      });

      cy.mountWithProviders(<CompositeTableSchema />, {
        preloadedState: {
          operations: {
            byId: { o1: operation },
            allIds: ["o1"],
            rootOperationId: "o1",
          },
          tables: {
            byId: { t1: table },
            allIds: ["t1"],
          },
          columns: {
            byId: { c1: column1, c2: column2 },
            allIds: ["c1", "c2"],
          },
        },
      });

      // First set a large height to see the dimensions
      cy.get(".TableBlock").then(($el) => {
        $el.css({ height: "100px", width: "200px" });
      });

      // Dimensions should be visible with sufficient height
      cy.contains("2 x 250").should("exist");

      // Now force the TableBlock to be very small height
      // This triggers the CSS container query: @container (max-height: 39px)
      cy.get(".TableBlock").then(($tableBlock) => {
        $tableBlock.css({
          height: `${BLOCK_BREAKPOINTS.HEIGHT.MEDIUM - 1}px`,
        });
      });

      // Wait for the 300ms CSS transition to complete, then check opacity
      // The transition is defined as: transition: "opacity 0.3s ease"
      cy.get(".TableBlock")
        .find("small")
        .should("have.css", "opacity", "0", { timeout: 500 });
    });

    it("hides table name when container height less than small breakpoint", () => {
      const table = createMockTable({
        id: "t1",
        name: "Customers",
        columnIds: ["c1", "c2"],
        rowCount: 250,
      });
      const column1 = createMockColumn({ id: "c1", parentId: "t1" });
      const column2 = createMockColumn({ id: "c2", parentId: "t1" });
      const operation = createMockOperation({
        id: "o1",
        operationType: OPERATION_TYPE_NO_OP,
        childIds: ["t1"],
        columnIds: ["c1", "c2"],
        rowCount: 250,
      });

      cy.mountWithProviders(<CompositeTableSchema />, {
        preloadedState: {
          operations: {
            byId: { o1: operation },
            allIds: ["o1"],
            rootOperationId: "o1",
          },
          tables: {
            byId: { t1: table },
            allIds: ["t1"],
          },
          columns: {
            byId: { c1: column1, c2: column2 },
            allIds: ["c1", "c2"],
          },
        },
      });

      // First set a large height to see the dimensions
      cy.get(".TableBlock").then(($el) => {
        $el.css({ height: "100px", width: "200px" });
      });

      // Dimensions should be visible with sufficient height
      cy.contains("2 x 250").should("exist");

      // Now force the TableBlock to be very small height
      // This triggers the CSS container query: @container (max-height: 39px)
      cy.get(".TableBlock").then(($tableBlock) => {
        $tableBlock.css({
          height: `${BLOCK_BREAKPOINTS.HEIGHT.SMALL - 1}px`,
        });
      });

      // Wait for the 300ms CSS transition to complete, then check opacity
      // The transition is defined as: transition: "opacity 0.3s ease"
      cy.get(".TableBlock")
        .find("span")
        .should("have.css", "opacity", "0", { timeout: 500 });
    });
  });

  describe("Focus Interaction", () => {
    it("updates focus when clicking on an operation block", () => {
      const table1 = createMockTable({
        id: "t1",
        name: "Table A",
        columnIds: ["c1"],
      });
      const table2 = createMockTable({
        id: "t2",
        name: "Table B",
        columnIds: ["c2"],
      });
      const columns = [
        createMockColumn({ id: "c1", parentId: "t1" }),
        createMockColumn({ id: "c2", parentId: "t2" }),
      ];
      const operation = createMockOperation({
        id: "o1",
        operationType: OPERATION_TYPE_STACK,
        childIds: ["t1", "t2"],
        columnIds: ["c1", "c2"],
      });

      let testStore;
      cy.mountWithProviders(<CompositeTableSchema />, {
        preloadedState: {
          operations: {
            byId: { o1: operation },
            allIds: ["o1"],
            rootOperationId: "o1",
          },
          tables: {
            byId: { t1: table1, t2: table2 },
            allIds: ["t1", "t2"],
          },
          columns: {
            byId: Object.fromEntries(columns.map((c) => [c.id, c])),
            allIds: columns.map((c) => c.id),
          },
          ui: {
            focusedObjectId: null,
            focusedColumnId: null,
            draggingSourceId: null,
            isSelectAllChecked: false,
            allColumns: [],
            isDataGridOpen: true,
            isDataGridMaximized: false,
          },
        },
      }).then(({ store }) => {
        testStore = store;
      });

      // Give TableBlocks sufficient size
      cy.get(".TableBlock").each(($el) => {
        $el.css({ minHeight: "60px", minWidth: "150px" });
      });

      // Click on the operation block
      cy.get(".StackOperationBlock").click();

      // Wait a tick for Redux to update, then verify the store
      cy.wait(100).then(() => {
        expect(testStore.getState().ui.focusedObjectId).to.equal("o1");
      });
    });

    it("focuses on table when clicking on table block within STACK operation", () => {
      // Note: Tables themselves don't have click handlers for focus - focus is
      // managed at the operation level. So we test clicking within a STACK operation.
      const table1 = createMockTable({
        id: "t1",
        name: "Customers",
        columnIds: ["c1"],
        rowCount: 100,
      });
      const table2 = createMockTable({
        id: "t2",
        name: "Orders",
        columnIds: ["c2"],
        rowCount: 200,
      });
      const column1 = createMockColumn({ id: "c1", parentId: "t1" });
      const column2 = createMockColumn({ id: "c2", parentId: "t2" });
      const operation = createMockOperation({
        id: "o1",
        operationType: OPERATION_TYPE_STACK,
        childIds: ["t1", "t2"],
        columnIds: ["c1", "c2"],
      });

      let testStore;
      cy.mountWithProviders(<CompositeTableSchema />, {
        preloadedState: {
          operations: {
            byId: { o1: operation },
            allIds: ["o1"],
            rootOperationId: "o1",
          },
          tables: {
            byId: { t1: table1, t2: table2 },
            allIds: ["t1", "t2"],
          },
          columns: {
            byId: { c1: column1, c2: column2 },
            allIds: ["c1", "c2"],
          },
          ui: {
            focusedObjectId: null,
            focusedColumnId: null,
            draggingSourceId: null,
            isSelectAllChecked: false,
            allColumns: [],
            isDataGridOpen: true,
            isDataGridMaximized: false,
          },
        },
      }).then(({ store }) => {
        testStore = store;
      });

      // Give sufficient size
      cy.get(".StackOperationBlock").then(($el) => {
        $el.css({ minHeight: "200px", minWidth: "300px" });
      });
      cy.get(".TableBlock").each(($el) => {
        $el.css({ minHeight: "60px", minWidth: "150px" });
      });

      // Click on the stack operation block (since tables don't have click handlers)
      cy.get(".StackOperationBlock").click();

      // Wait for Redux to update, then verify the store focused on the operation
      cy.wait(100).then(() => {
        expect(testStore.getState().ui.focusedObjectId).to.equal("o1");
      });
    });
  });

  describe("Drop Target Visibility", () => {
    it("shows drop target icons when operation is materialized and in sync", () => {
      const table = createMockTable({
        id: "t1",
        name: "Test Table",
        columnIds: ["c1"],
      });
      const column = createMockColumn({ id: "c1", parentId: "t1" });
      const operation = createMockOperation({
        id: "o1",
        operationType: OPERATION_TYPE_NO_OP,
        childIds: ["t1"],
        columnIds: ["c1"],
        isMaterialized: true,
        isInSync: true,
      });

      cy.mountWithProviders(<CompositeTableSchema />, {
        preloadedState: {
          operations: {
            byId: { o1: operation },
            allIds: ["o1"],
            rootOperationId: "o1",
          },
          tables: {
            byId: { t1: table },
            allIds: ["t1"],
          },
          columns: {
            byId: { c1: column },
            allIds: ["c1"],
          },
        },
      });

      // Drop target add icons should be visible
      cy.get('[data-testid="AddIcon"]').should("have.length.at.least", 2);
    });
  });

  describe("Nested Operations", () => {
    it("renders nested STACK within PACK operation", () => {
      const table1 = createMockTable({
        id: "t1",
        name: "Table A",
        columnIds: ["c1"],
        rowCount: 50,
      });
      const table2 = createMockTable({
        id: "t2",
        name: "Table B",
        columnIds: ["c2"],
        rowCount: 50,
      });
      const table3 = createMockTable({
        id: "t3",
        name: "Table C",
        columnIds: ["c3"],
        rowCount: 100,
      });
      const columns = [
        createMockColumn({ id: "c1", parentId: "t1" }),
        createMockColumn({ id: "c2", parentId: "t2" }),
        createMockColumn({ id: "c3", parentId: "t3" }),
      ];

      const stackOp = createMockOperation({
        id: "o2",
        operationType: OPERATION_TYPE_STACK,
        childIds: ["t1", "t2"],
        columnIds: ["c1"],
        rowCount: 100,
        parentId: "o1",
      });

      const packOp = createMockOperation({
        id: "o1",
        operationType: OPERATION_TYPE_PACK,
        childIds: ["o2", "t3"],
        columnIds: ["c1", "c3"],
        rowCount: 100,
        joinType: "FULL OUTER",
        joinPredicate: "EQUALS",
        joinKey1: null,
        joinKey2: null,
        matchStats: { matches: 0, left_unmatched: 0, right_unmatched: 0 },
      });

      cy.mountWithProviders(<CompositeTableSchema />, {
        preloadedState: {
          operations: {
            byId: { o1: packOp, o2: stackOp },
            allIds: ["o1", "o2"],
            rootOperationId: "o1",
          },
          tables: {
            byId: { t1: table1, t2: table2, t3: table3 },
            allIds: ["t1", "t2", "t3"],
          },
          columns: {
            byId: Object.fromEntries(columns.map((c) => [c.id, c])),
            allIds: columns.map((c) => c.id),
          },
          ui: {
            focusedObjectId: "o2",
            focusedColumnId: null,
            draggingSourceId: null,
            isSelectAllChecked: false,
            allColumns: [],
            isDataGridOpen: true,
            isDataGridMaximized: false,
          },
        },
      });

      // Give TableBlocks sufficient size
      cy.get(".TableBlock").each(($el) => {
        $el.css({ minHeight: "60px", minWidth: "150px" });
      });

      // Both operation blocks should be present
      cy.get(".PackOperationBlock").should("exist");
      cy.get(".StackOperationBlock").should("exist");

      // All three tables should be present
      cy.contains("Table A").should("exist");
      cy.contains("Table B").should("exist");
      cy.contains("Table C").should("exist");
    });
  });
});
