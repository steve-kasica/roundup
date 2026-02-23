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
  JOIN_PREDICATES,
  JOIN_TYPES,
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

  describe("Parent's column count is greater than sum of children's column counts", () => {
    beforeEach(() => {
      cy.mountWithProviders(
        <PackOperationBlock
          childIds={["t3", "o1"]}
          depth={0}
          isFocused={true}
          // eslint-disable-next-line no-unused-vars
          isDarkBackground={(depth) => false}
          leftColumnCount={4} // t3 has 4 columns
          rightColumnCount={3} // o1 has 3 columns
          columnCount={10} // pack op. has 10 columns, more than sum of children (4+3=7)
          totalCount={0} // no errors
          parentColumnCount={10} // parent has same column count as this operation
        />,
        {
          preloadedState: {
            operations: {
              byId: {
                o1: {
                  id: "o1",
                  name: "Pack Operation 1",
                  databaseName: "pack_op_1",
                  operationType: OPERATION_TYPE_PACK,
                  parentId: "o2",
                  childIds: ["t1", "t2"],
                  columnIds: ["oc1", "oc2", "oc3"],
                  columnCount: 3,
                  rowCount: null,
                  joinType: JOIN_TYPES.FULL_OUTER,
                  joinKey1: "c1",
                  joinKey2: "c4",
                  joinPredicate: JOIN_PREDICATES.EQUALS,
                  matchStats: {
                    matches: 10,
                    left_unmatched: 5,
                    right_unmatched: 3,
                  },
                  isMaterialized: false,
                  isInSync: false,
                },
                o2: {
                  id: "o2",
                  name: "Stack Operation 2",
                  databaseName: "stack_op_2",
                  operationType: OPERATION_TYPE_STACK,
                  childIds: ["t3", "o1"],
                  columnIds: ["oc4", "oc5", "oc6"],
                  columnCount: 3,
                  rowCount: 100,
                  isMaterialized: false,
                  isInSync: false,
                },
              },
              allIds: ["o2", "o1"],
              rootOperationId: "o2",
            },
            tables: {
              byId: {
                t1: {
                  id: "t1",
                  name: "Table 1",
                  databaseName: "table_1",
                  source: "test",
                  fileName: "table1.csv",
                  rowCount: 40,
                  parentId: "o1",
                  columnIds: ["c1", "c2", "c3"],
                },
                t2: {
                  id: "t2",
                  name: "Table 2",
                  databaseName: "table_2",
                  source: "test",
                  fileName: "table2.csv",
                  rowCount: 60,
                  parentId: "o1",
                  columnIds: ["c4", "c5"],
                },
                t3: {
                  id: "t3",
                  name: "Table 3",
                  databaseName: "table_3",
                  source: "test",
                  fileName: "table3.csv",
                  rowCount: 100,
                  parentId: "o2",
                  columnIds: ["c6", "c7", "c8", "c9"],
                },
              },
              allIds: ["t1", "t2", "t3"],
            },
            columns: {
              byId: {
                c1: {
                  id: "c1",
                  parentId: "t1",
                  name: "c1",
                  databaseName: "c1",
                  type: "TEXT",
                },
                c2: {
                  id: "c2",
                  parentId: "t1",
                  name: "c2",
                  databaseName: "c2",
                  type: "TEXT",
                },
                c3: {
                  id: "c3",
                  parentId: "t1",
                  name: "c3",
                  databaseName: "c3",
                  type: "TEXT",
                },
                c4: {
                  id: "c4",
                  parentId: "t2",
                  name: "c4",
                  databaseName: "c4",
                  type: "TEXT",
                },
                c5: {
                  id: "c5",
                  parentId: "t2",
                  name: "c5",
                  databaseName: "c5",
                  type: "TEXT",
                },
                c6: {
                  id: "c6",
                  parentId: "t3",
                  name: "c6",
                  databaseName: "c6",
                  type: "TEXT",
                },
                c7: {
                  id: "c7",
                  parentId: "t3",
                  name: "c7",
                  databaseName: "c7",
                  type: "TEXT",
                },
                c8: {
                  id: "c8",
                  parentId: "t3",
                  name: "c8",
                  databaseName: "c8",
                  type: "TEXT",
                },
                c9: {
                  id: "c9",
                  parentId: "t3",
                  name: "c9",
                  databaseName: "c9",
                  type: "TEXT",
                },
                oc1: {
                  id: "oc1",
                  parentId: "o1",
                  name: "oc1",
                  databaseName: "oc1",
                  type: "TEXT",
                },
                oc2: {
                  id: "oc2",
                  parentId: "o1",
                  name: "oc2",
                  databaseName: "oc2",
                  type: "TEXT",
                },
                oc3: {
                  id: "oc3",
                  parentId: "o1",
                  name: "oc3",
                  databaseName: "oc3",
                  type: "TEXT",
                },
                oc4: {
                  id: "oc4",
                  parentId: "o2",
                  name: "oc4",
                  databaseName: "oc4",
                  type: "TEXT",
                },
                oc5: {
                  id: "oc5",
                  parentId: "o2",
                  name: "oc5",
                  databaseName: "oc5",
                  type: "TEXT",
                },
                oc6: {
                  id: "oc6",
                  parentId: "o2",
                  name: "oc6",
                  databaseName: "oc6",
                  type: "TEXT",
                },
              },
              allIds: [
                "c1",
                "c2",
                "c3",
                "c4",
                "c5",
                "c6",
                "c7",
                "c8",
                "oc1",
                "oc2",
                "oc3",
                "oc4",
                "oc5",
                "oc6",
              ],
            },
            ui: mockUi,
          },
        },
      );
    });
    it("should render a third block to make up the difference in parent-child column count", () => {
      cy.get(".PackOperationBlock")
        .find("> div.difference")
        .should("exist")
        .and("be.visible");
    });
    it("should render the difference block with correct proportional width", () => {
      const operationColumnCount = 10;
      const childColumnCount = 7; // 4 + 3
      const expectedDifferenceWidthPercent =
        ((operationColumnCount - childColumnCount) / operationColumnCount) *
        100; // 30%

      cy.get(".PackOperationBlock").then(($el) => {
        const containerWidth = $el.width();

        // Check difference block has proportional width
        cy.get(".PackOperationBlock")
          .find("> div.difference")
          .should("be.visible")
          .then(($el) => {
            const actualWidth = $el.width();
            const expectedWidth =
              (expectedDifferenceWidthPercent / 100) * containerWidth;
            // Allow for rounding and the 2px margin
            expect(actualWidth).to.be.closeTo(expectedWidth, 100);
          });
      });
    });
  });
});
