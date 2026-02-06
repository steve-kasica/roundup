/* eslint-disable no-undef */
import DeleteColumnsButton from "./DeleteColumnsButton";
import { state } from "./fixtures.js";

describe("DeleteColumnsButton Component", () => {
  beforeEach(() => {
    cy.mountWithProviders(<DeleteColumnsButton />, {
      preloadedState: state,
    });
  });
  describe("Basic functionality", () => {
    it("renders the button", () => {
      cy.get("button").should("exist");
    });
  });

  describe("Focused object is a table", () => {
    const stateWithFocusedTable = {
      ...state,
      ui: {
        ...state.ui,
        focusedObjectId: "t1", // Focus on table
        selectedColumnIds: ["c1", "c2"], // Select its columns
      },
    };
    beforeEach(() => {
      cy.mountWithProviders(<DeleteColumnsButton />, {
        preloadedState: stateWithFocusedTable,
      });
    });

    it("enables the button when columns are selected", () => {
      cy.get("button").should("not.be.disabled");
    });

    it("disables the button when no columns are selected", () => {
      const stateWithNoSelectedColumns = {
        ...stateWithFocusedTable,
        ui: {
          ...stateWithFocusedTable.ui,
          selectedColumnIds: [],
        },
      };
      cy.mountWithProviders(<DeleteColumnsButton />, {
        preloadedState: stateWithNoSelectedColumns,
      });
      cy.get("button").should("be.disabled");
    });
    describe("table is read-only", () => {
      beforeEach(() => {
        cy.mountWithProviders(<DeleteColumnsButton />, {
          preloadedState: {
            ...stateWithFocusedTable,
            operations: {
              ...stateWithFocusedTable.operations,
              rootOperationId: "o0", // Make o1 NOT the root operation (isReadOnly = true)
              allIds: ["o0", "o1"],
              byId: {
                ...stateWithFocusedTable.operations.byId,
                o0: {
                  id: "o0",
                  operationType: "stack",
                  childIds: ["o1"],
                },
                o1: {
                  ...stateWithFocusedTable.operations.byId.o1,
                  parentId: "o0",
                },
              },
            },
          },
        });
      });
      it("disables the button even when columns are selected", () => {
        cy.get("button").should("be.disabled");
      });
    });
  });

  describe("Focused object is an operation", () => {
    const stateWithFocusedOperation = {
      ...state,
      ui: {
        ...state.ui,
        focusedObjectId: "o1", // Focus on operation
      },
    };
    beforeEach(() => {
      cy.mountWithProviders(<DeleteColumnsButton />, {
        preloadedState: stateWithFocusedOperation,
      });
    });

    it("enables the button when columns are selected", () => {
      cy.get("button").should("not.be.disabled");
    });

    it("disables the button when no columns are selected", () => {
      const stateWithNoSelectedColumns = {
        ...stateWithFocusedOperation,
        ui: {
          ...stateWithFocusedOperation.ui,
          selectedColumnIds: [],
        },
      };
      cy.mountWithProviders(<DeleteColumnsButton />, {
        preloadedState: stateWithNoSelectedColumns,
      });
      cy.get("button").should("be.disabled");
    });

    describe("focused operation is read-only", () => {
      beforeEach(() => {
        cy.mountWithProviders(<DeleteColumnsButton />, {
          preloadedState: {
            ...stateWithFocusedOperation,
            ui: {
              ...stateWithFocusedOperation.ui,
              focusedObjectId: "o1", // Focus on operation
            },
            operations: {
              ...stateWithFocusedOperation.operations,
              rootOperationId: "o0", // Make o1 NOT the root operation (isReadOnly = true)
              allIds: ["o0", "o1"],
              byId: {
                ...stateWithFocusedOperation.operations.byId,
                o0: {
                  id: "o0",
                  operationType: "stack",
                  childIds: ["o1"],
                },
                o1: {
                  ...stateWithFocusedOperation.operations.byId.o1,
                  parentId: "o0",
                },
              },
            },
          },
        });
      });
      it("disables the button", () => {
        cy.get("button").should("be.disabled");
      });
    });
  });
});
