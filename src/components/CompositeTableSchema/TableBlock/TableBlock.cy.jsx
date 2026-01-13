/* eslint-disable no-undef */
/**
 * @fileoverview Cypress component tests for TableBlock.
 * @module components/CompositeTableSchema/TableBlock/TableBlock.cy
 *
 * These tests verify:
 * - Visual styling based on operation index
 * - Responsive display of table metadata
 * - Column tick rendering
 * - Container query breakpoint behavior
 */

import { TableBlock } from "./TableBlock";
import {
  OPERATION_TYPE_NO_OP,
  OPERATION_TYPE_STACK,
} from "../../../slices/operationsSlice/Operation";
import { BLOCK_BREAKPOINTS } from "../settings";

/**
 * Helper to create mock column data
 */
function createMockColumn({
  id = "c1",
  parentId = "t1",
  name = "Column",
  index = 0,
} = {}) {
  return {
    id,
    parentId,
    name,
    index,
    columnType: "CATEGORICAL",
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

/**
 * Helper to create default Redux state with columns
 */
function createDefaultState(columnIds = ["c1", "c2", "c3"]) {
  const columns = columnIds.reduce((acc, id, index) => {
    acc[id] = createMockColumn({
      id,
      parentId: "t1",
      name: `Column ${index + 1}`,
      index,
    });
    return acc;
  }, {});

  return {
    columns: {
      byId: columns,
      allIds: columnIds,
    },
    operations: {
      byId: {
        o1: {
          id: "o1",
          operationType: OPERATION_TYPE_NO_OP,
          childIds: ["t1"],
          columnIds: columnIds,
          rowCount: 100,
        },
      },
      allIds: ["o1"],
      rootOperationId: "o1",
    },
    tables: {
      byId: {
        t1: {
          id: "t1",
          name: "Customers",
          columnIds: columnIds,
          rowCount: 100,
          parentId: "o1",
        },
      },
      allIds: ["t1"],
    },
  };
}

describe("TableBlock component", () => {
  const defaultProps = {
    id: "t1",
    name: "Customers",
    columnIds: ["c1", "c2", "c3"],
    columnCount: 3,
    rowCount: 100,
    operationIndex: 0,
    parentOperationType: OPERATION_TYPE_NO_OP,
    parentColumnCount: 3,
    parentRowCount: 100,
    totalCount: 0, // No alerts
  };

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

  describe("Table block", () => {
    it("should render the table block with correct structure", () => {
      cy.mountWithProviders(<TableBlock {...defaultProps} />, {
        preloadedState: createDefaultState(),
      });
      cy.get(".TableBlock").should("exist");
    });

    // it("should show warning color when alerts are present", () => {
    //   cy.mountWithProviders(<TableBlock {...defaultProps} totalCount={5} />, {
    //     preloadedState: createDefaultState(),
    //   });
    //   cy.get(".TableBlock").should("have.css", "opacity", "0.9");
    // });
  });

  describe("Dimensions label", () => {
    it("should display the correct table dimensions", () => {
      cy.mountWithProviders(<TableBlock {...defaultProps} />, {
        preloadedState: createDefaultState(),
      });

      // Set minimum dimensions to ensure visibility
      cy.get(".TableBlock").then(($el) => {
        $el.css({ minHeight: "50px", minWidth: "100px" });
      });

      cy.contains("3 x 100").should("be.visible");
    });

    it("should be ontop of the column ticks", () => {
      cy.mountWithProviders(<TableBlock {...defaultProps} />, {
        preloadedState: createDefaultState(),
      });

      // Set minimum dimensions to ensure visibility
      cy.get(".TableBlock").then(($el) => {
        $el.css({ minHeight: "50px", minWidth: "100px" });
      });

      cy.contains("3 x 100")
        .should("be.visible")
        .then(($label) => {
          cy.get(".ColumnTick")
            .first()
            .then(($tick) => {
              const labelZ = parseInt(
                window.getComputedStyle($label[0]).zIndex || "0",
                10
              );
              const tickZ = parseInt(
                window.getComputedStyle($tick[0]).zIndex || "0",
                10
              );
              expect(labelZ).to.be.greaterThan(tickZ);
            });
        });
    });

    it("should hide the table dimensions when the TableBlock is too short", () => {
      cy.mountWithProviders(<TableBlock {...defaultProps} />, {
        preloadedState: createDefaultState(),
      });

      // Set height below MEDIUM breakpoint (30px)
      cy.get(".TableBlock").then(($el) => {
        $el.css({
          height: `${BLOCK_BREAKPOINTS.HEIGHT.MEDIUM - 1}px`,
          width: "200px",
        });
      });

      cy.wait(100); // Wait for CSS container query to apply
      cy.contains("3 x 100").should("not.be.visible");
    });

    it("should hide the table dimensions when the TableBlock is too narrow", () => {
      cy.mountWithProviders(<TableBlock {...defaultProps} />, {
        preloadedState: createDefaultState(),
      });

      // Set width below SMALL breakpoint (50px)
      cy.get(".TableBlock").then(($el) => {
        $el.css({
          height: "60px",
          width: `${BLOCK_BREAKPOINTS.WIDTH.SMALL - 1}px`,
        });
      });

      cy.wait(100); // Wait for CSS container query to apply
      cy.contains("3 x 100").should("not.be.visible");
    });

    it("should show dimensions when above both height and width breakpoints", () => {
      cy.mountWithProviders(<TableBlock {...defaultProps} />, {
        preloadedState: createDefaultState(),
      });

      cy.get(".TableBlock").then(($el) => {
        $el.css({
          height: `${BLOCK_BREAKPOINTS.HEIGHT.MEDIUM + 10}px`,
          width: `${BLOCK_BREAKPOINTS.WIDTH.SMALL + 10}px`,
        });
      });

      cy.wait(100);
      cy.contains("3 x 100").should("be.visible");
    });
  });

  describe("Table label", () => {
    it("should display the correct table name", () => {
      cy.mountWithProviders(<TableBlock {...defaultProps} />, {
        preloadedState: createDefaultState(),
      });

      cy.get(".TableBlock").then(($el) => {
        $el.css({ minHeight: "50px", minWidth: "200px" });
      });

      cy.contains("Customers").should("be.visible");
    });

    it("should be ontop of the column ticks", () => {
      cy.mountWithProviders(<TableBlock {...defaultProps} />, {
        preloadedState: createDefaultState(),
      });

      // Set minimum dimensions to ensure visibility
      cy.get(".TableBlock").then(($el) => {
        $el.css({ minHeight: "50px", minWidth: "100px" });
      });

      cy.contains("Customers")
        .should("be.visible")
        .then(($label) => {
          cy.get(".ColumnTick")
            .first()
            .then(($tick) => {
              const labelZ = parseInt(
                window.getComputedStyle($label[0]).zIndex || "0",
                10
              );
              const tickZ = parseInt(
                window.getComputedStyle($tick[0]).zIndex || "0",
                10
              );
              expect(labelZ).to.be.greaterThan(tickZ);
            });
        });
    });

    it("should fall back to id when name is not provided", () => {
      cy.mountWithProviders(<TableBlock {...defaultProps} name={null} />, {
        preloadedState: createDefaultState(),
      });

      cy.get(".TableBlock").then(($el) => {
        $el.css({ minHeight: "50px", minWidth: "200px" });
      });

      cy.contains("t1").should("be.visible");
    });

    it("should hide the table name when the TableBlock is too short", () => {
      cy.mountWithProviders(<TableBlock {...defaultProps} />, {
        preloadedState: createDefaultState(),
      });

      // Set height below SMALL breakpoint (15px)
      cy.get(".TableBlock").then(($el) => {
        $el.css({
          height: `${BLOCK_BREAKPOINTS.HEIGHT.SMALL - 1}px`,
          width: "200px",
        });
      });

      cy.wait(100);
      cy.contains("Customers").should("not.be.visible");
    });

    it("should show the table name when height is above SMALL breakpoint", () => {
      cy.mountWithProviders(<TableBlock {...defaultProps} />, {
        preloadedState: createDefaultState(),
      });

      cy.get(".TableBlock").then(($el) => {
        $el.css({
          height: `${BLOCK_BREAKPOINTS.HEIGHT.SMALL + 5}px`,
          width: "200px",
        });
      });

      cy.wait(100);
      cy.contains("Customers").should("be.visible");
    });
  });

  describe("Column ticks", () => {
    it("should render correct number of column ticks", () => {
      cy.mountWithProviders(<TableBlock {...defaultProps} />, {
        preloadedState: createDefaultState(),
      });

      // Should render 3 column ticks (one for each column)
      cy.get(".TableBlock").within(() => {
        cy.get(".ColumnTick").should("have.length", 3);
      });
    });

    it("should render column ticks with width proportional to column count", () => {
      const columnIds = ["c1", "c2", "c3", "c4"];
      cy.mountWithProviders(
        <TableBlock {...defaultProps} columnCount={4} columnIds={columnIds} />,
        {
          preloadedState: createDefaultState(columnIds),
        }
      );

      cy.get(".TableBlock").within(() => {
        cy.get(".ColumnTick").should("have.length", 4);
      });
    });

    it("should render column ticks with borders between them", () => {
      cy.mountWithProviders(<TableBlock {...defaultProps} />, {
        preloadedState: createDefaultState(),
      });

      // First two ticks should have right border, last one should not
      cy.get(".TableBlock").within(() => {
        cy.get(".ColumnTick")
          .first()
          .should("have.css", "border-right-style", "solid");
        cy.get(".ColumnTick")
          .last()
          .should("have.css", "border-right-style", "none");
      });
    });

    it("should render empty column ticks for STACK operations with mismatched columns", () => {
      // Parent has 4 columns but table only has 2
      const columnIds = ["c1", "c2"];
      cy.mountWithProviders(
        <TableBlock
          {...defaultProps}
          parentOperationType={OPERATION_TYPE_STACK}
          parentColumnCount={4}
          columnCount={2}
          columnIds={columnIds}
        />,
        {
          preloadedState: createDefaultState(columnIds),
        }
      );

      // Should render 4 ticks (2 real + 2 empty)
      cy.get(".TableBlock").within(() => {
        cy.get(".ColumnContainer, .ColumnTick").should("have.length", 4);
      });
    });

    it("should use parent column count for STACK operations", () => {
      cy.mountWithProviders(
        <TableBlock
          {...defaultProps}
          parentOperationType={OPERATION_TYPE_STACK}
          parentColumnCount={5}
          columnCount={3}
          columnIds={["c1", "c2", "c3"]}
        />,
        {
          preloadedState: createDefaultState(),
        }
      );

      // Should render 5 ticks (parent count)
      cy.get(".TableBlock").within(() => {
        cy.get(".ColumnContainer, .ColumnTick").should("have.length", 5);
      });
    });

    it("should use table column count for non-STACK operations", () => {
      cy.mountWithProviders(
        <TableBlock
          {...defaultProps}
          parentOperationType={OPERATION_TYPE_NO_OP}
          parentColumnCount={5}
          columnCount={3}
          columnIds={["c1", "c2", "c3"]}
        />,
        {
          preloadedState: createDefaultState(),
        }
      );

      // Should render 3 ticks (table's own count)
      cy.get(".TableBlock").within(() => {
        cy.get(".ColumnContainer, .ColumnTick").should("have.length", 3);
      });
    });
  });
});
