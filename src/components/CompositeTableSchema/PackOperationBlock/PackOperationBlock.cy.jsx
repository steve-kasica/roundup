/* eslint-disable no-undef */
/**
 * @fileoverview Cypress component tests for PackOperationBlock.
 * @module components/CompositeTableSchema/PackOperationBlock/PackOperationBlock.cy
 *
 * These tests verify:
 * - Container rendering
 * - Child TableBlocks with proportional widths
 * - Horizontal packing layout
 * - Height inheritance
 */

import {
  Operation,
  OPERATION_TYPE_PACK,
  OPERATION_TYPE_STACK,
} from "../../../slices/operationsSlice";
import { PackOperationBlock } from "./PackOperationBlock";

// Mock state data
const mockTables = {
  allIds: ["t1", "t2", "t3"],
  byId: {
    t1: {
      id: "t1",
      name: "Table 1",
      columnIds: ["c1", "c2", "c3"],
      rowCount: 100,
      parentId: null,
    },
    t2: {
      id: "t2",
      name: "Table 2",
      columnIds: Array.from({ length: 21 }, (_, i) => `c${i + 100}`), // 21 columns
      rowCount: 150,
      parentId: null,
    },
    t3: {
      id: "t3",
      name: "Table 3",
      columnIds: ["c200", "c201", "c202", "c203"], // 4 columns
      rowCount: 200,
      parentId: null,
    },
  },
};

// Create mock columns for all table columns
const createMockColumns = (tables) => {
  const allIds = [];
  const byId = {};

  Object.values(tables.byId).forEach((table) => {
    table.columnIds.forEach((columnId, index) => {
      allIds.push(columnId);
      byId[columnId] = {
        id: columnId,
        name: `Column ${columnId}`,
        databaseName: `col_${columnId}`,
        parentId: table.id,
        type: "TEXT",
      };
    });
  });

  return { allIds, byId };
};

const mockColumns = createMockColumns(mockTables);

const mockUi = {
  focusedObjectId: null,
  hoveredColumnIds: [],
  selectedColumnIds: [],
  draggingColumnId: null,
  dropTargetColumnId: null,
  focusedColumnIds: [],
  visibleColumnIds: [],
};

describe("PackOperationBlock Component", () => {
  let state;
  let packOperation;

  describe("All children are tables", () => {
    beforeEach(() => {
      // Create state and mount component before each test
      packOperation = Operation({
        operationType: OPERATION_TYPE_PACK,
        childIds: ["t2", "t3"],
        columnIds: Array.from(
          {
            length:
              mockTables.byId["t2"].columnIds.length +
              mockTables.byId["t3"].columnIds.length,
          },
          (_, i) => `c${i + 1000}`, // dummy column IDs
        ),
        rowCount: Math.max(
          mockTables.byId["t2"].rowCount,
          mockTables.byId["t3"].rowCount,
        ),
      });

      // Update tables to have correct parentId
      const tables = {
        ...mockTables,
        byId: {
          ...mockTables.byId,
          t2: {
            ...mockTables.byId.t2,
            parentId: packOperation.id,
          },
          t3: {
            ...mockTables.byId.t3,
            parentId: packOperation.id,
          },
        },
      };

      // Create columns for the pack operation
      const packColumns = {};
      packOperation.columnIds.forEach((columnId, index) => {
        packColumns[columnId] = {
          id: columnId,
          name: `Pack Column ${index}`,
          databaseName: `pack_col_${index}`,
          parentId: packOperation.id,
          type: "TEXT",
        };
      });

      state = {
        columns: {
          ...mockColumns,
          allIds: [...mockColumns.allIds, ...packOperation.columnIds],
          byId: {
            ...mockColumns.byId,
            ...packColumns,
          },
        },
        tables,
        operations: {
          byId: {
            [packOperation.id]: packOperation,
          },
          allIds: [packOperation.id],
          rootOperationId: packOperation.id,
        },
        ui: mockUi,
      };

      cy.mountWithProviders(
        <div
          style={{
            display: "flex",
            width: "800px",
            height: "600px",
          }}
        >
          <PackOperationBlock
            childIds={packOperation.childIds}
            depth={0}
            isFocused={false}
            isDarkBackground={() => false}
            leftColumnCount={
              state.tables.byId[packOperation.childIds[0]].columnIds.length
            }
            rightColumnCount={
              state.tables.byId[packOperation.childIds[1]].columnIds.length
            }
            columnCount={packOperation.columnIds.length}
            totalCount={0} // no errors
          />
        </div>,
        {
          preloadedState: state,
        },
      );
    });
    it("should render the PackOperationBlock container", () => {
      cy.get(".PackOperationBlock").should("exist");
    });
    it("should arrange child TableBlocks side-by-side horizontally", () => {
      // Check that the container holding child blocks has horizontal flex layout
      cy.get(".PackOperationBlock").should("have.css", "flex-direction", "row");

      // Verify two TableBlocks are rendered as children
      cy.get(".TableBlock").should("have.length", 2);
    });

    it("should render child TableBlocks with widths proportional to their column counts", () => {
      const leftColumnCount = state.tables.byId["t2"].columnIds.length; // 21 columns
      const rightColumnCount = state.tables.byId["t3"].columnIds.length; // 4 columns
      const totalColumnCount = leftColumnCount + rightColumnCount; // 25 columns

      // Calculate expected width ratios
      const expectedLeftWidthPercent =
        (leftColumnCount / totalColumnCount) * 100; // 84%
      const expectedRightWidthPercent =
        (rightColumnCount / totalColumnCount) * 100; // 16%

      // Get both TableBlocks
      cy.get(".TableBlock").should("have.length", 2);

      // Wait for layout to complete
      cy.wait(100);

      // Get the actual parent container (the inner Box with row layout)
      cy.get(".PackOperationBlock").then(($el) => {
        const containerWidth = $el.width();

        // Check first child (left) has proportional width (84%)
        cy.get(".TableBlock")
          .first()
          .should("be.visible")
          .then(($el) => {
            const actualWidth = $el.width();
            const expectedWidth =
              (expectedLeftWidthPercent / 100) * containerWidth;
            // Allow for rounding and the 2px margin
            expect(actualWidth).to.be.closeTo(expectedWidth, 5);
          });

        // Check second child (right) has proportional width (16%)
        cy.get(".TableBlock")
          .last()
          .should("be.visible")
          .then(($el) => {
            const actualWidth = $el.width();
            const expectedWidth =
              (expectedRightWidthPercent / 100) * containerWidth;
            // Allow for rounding and the 2px margin
            expect(actualWidth).to.be.closeTo(expectedWidth, 5);
          });
      });
    });

    it("should have child TableBlocks inherit the height of the PackOperationBlock", () => {
      cy.wait(100); // Allow for layout calculations

      // Verify that the parent container sets up proper flex layout
      // which allows child TableBlocks to inherit height
      cy.get(".PackOperationBlock > .TableBlock").each(($el) => {
        const actualHeight = $el.height();
        // const expectedHeight = testHeight;
        const expectedHeight = 600; // since we set the outer div to 600px
        // Allow for minor rendering differences
        expect(actualHeight).to.be.closeTo(expectedHeight, 5);
      });
    });
  });

  describe("One child is a stack operation", () => {
    let stackOperation;
    beforeEach(() => {
      stackOperation = Operation({
        operationType: OPERATION_TYPE_STACK,
        childIds: ["t1", "t2"],
        columnIds: Array.from({ length: 3 }, (_, i) => `c${i + 2000}`), // dummy column IDs
        rowCount:
          mockTables.byId["t1"].rowCount + mockTables.byId["t2"].rowCount,
      });
      packOperation = Operation({
        operationType: OPERATION_TYPE_PACK,
        childIds: [stackOperation.id, "t3"],
        columnIds: Array.from(
          {
            length:
              stackOperation.columnIds.length +
              mockTables.byId["t3"].columnIds.length,
          },
          (_, i) => `c${i + 3000}`,
        ),
      });

      // Create columns for the stack operation
      const stackColumns = {};
      stackOperation.columnIds.forEach((columnId, index) => {
        stackColumns[columnId] = {
          id: columnId,
          name: `Stack Column ${index}`,
          databaseName: `stack_col_${index}`,
          parentId: stackOperation.id,
          type: "TEXT",
        };
      });

      // Create columns for the pack operation
      const packColumns = {};
      packOperation.columnIds.forEach((columnId, index) => {
        packColumns[columnId] = {
          id: columnId,
          name: `Pack Column ${index}`,
          databaseName: `pack_col_${index}`,
          parentId: packOperation.id,
          type: "TEXT",
        };
      });

      // Create state and mount component before each test
      state = {
        columns: {
          ...mockColumns,
          allIds: [
            ...mockColumns.allIds,
            ...stackOperation.columnIds,
            ...packOperation.columnIds,
          ],
          byId: {
            ...mockColumns.byId,
            ...stackColumns,
            ...packColumns,
          },
        },
        tables: {
          ...mockTables,
          byId: {
            t1: {
              ...mockTables.byId.t1,
              parentId: stackOperation.id,
              columnIds: mockTables.byId["t1"].columnIds.slice(0, 3),
            },
            t2: {
              ...mockTables.byId.t2,
              parentId: stackOperation.id,
              columnIds: mockTables.byId["t2"].columnIds.slice(0, 3),
            },
            t3: {
              ...mockTables.byId.t3,
              parentId: packOperation.id,
            },
          },
        },
        operations: {
          byId: {
            [stackOperation.id]: stackOperation,
            [packOperation.id]: packOperation,
          },
          allIds: [stackOperation.id, packOperation.id],
          rootOperationId: packOperation.id,
        },
        ui: mockUi,
      };

      cy.mountWithProviders(
        <div
          style={{
            display: "flex",
            width: "800px",
            height: "600px",
          }}
        >
          <PackOperationBlock
            childIds={packOperation.childIds}
            depth={0}
            isFocused={false}
            isDarkBackground={() => false}
            leftColumnCount={
              state.operations.byId[packOperation.childIds[0]].columnIds.length
            }
            rightColumnCount={
              state.tables.byId[packOperation.childIds[1]].columnIds.length
            }
            columnCount={packOperation.columnIds.length}
            totalCount={0} // no errors
          />
        </div>,
        {
          preloadedState: state,
        },
      );
    });

    it("should render", () => {
      cy.get(".PackOperationBlock").should("exist");
    });

    it("should render a StackOperationBlock as the first child", () => {
      cy.get(".PackOperationBlock")
        .find(".StackOperationBlock")
        .should("exist")
        .and("be.visible");
    });

    it("should render a TableBlock as the second child", () => {
      cy.get(".PackOperationBlock")
        .find("> .TableBlock")
        .should("have.length", 1)
        .and("be.visible");
    });

    it("should arrange children side-by-side horizontally", () => {
      cy.get(".PackOperationBlock").should("have.css", "flex-direction", "row");
    });

    it("should render child blocks with widths proportional to their column counts", () => {
      const leftColumnCount =
        state.operations.byId[packOperation.childIds[0]].columnIds.length; // 3 columns
      const rightColumnCount =
        state.tables.byId[packOperation.childIds[1]].columnIds.length; // 4 columns
      const totalColumnCount = leftColumnCount + rightColumnCount; // 7 columns

      // Calculate expected width ratios
      const expectedLeftWidthPercent =
        (leftColumnCount / totalColumnCount) * 100; // ~42.86%
      const expectedRightWidthPercent =
        (rightColumnCount / totalColumnCount) * 100; // ~57.14%

      // Get both child blocks
      cy.get(".PackOperationBlock").then(($el) => {
        const containerWidth = $el.width();

        // Check first child has proportional width
        cy.get(".PackOperationBlock")
          .find("> div")
          .first()
          .should("be.visible")
          .then(($el) => {
            const actualWidth = $el.width();
            const expectedWidth =
              (expectedLeftWidthPercent / 100) * containerWidth;
            // Allow for rounding and the 2px margin
            expect(actualWidth).to.be.closeTo(expectedWidth, 5);
          });

        // Check second child has proportional width
        cy.get(".PackOperationBlock")
          .find("> div")
          .last()
          .should("be.visible")
          .then(($el) => {
            const actualWidth = $el.width();
            const expectedWidth =
              (expectedRightWidthPercent / 100) * containerWidth;
            // Allow for rounding and the 2px margin
            expect(actualWidth).to.be.closeTo(expectedWidth, 5);
          });
      });
    });
  });
});
