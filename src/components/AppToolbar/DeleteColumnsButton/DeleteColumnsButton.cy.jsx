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
    let localState;
    beforeEach(() => {
      localState = {
        ui: {
          focusedObjectId: "t1",
          selectedColumnIds: ["c1", "c2"],
        },
        tables: {
          byId: {
            t1: {
              id: "t1",
              name: "Table 1",
              columnIds: ["c1", "c2"],
            },
          },
          allIds: ["t1"],
        },
        operations: {
          byId: {
            o1: {
              id: "o1",
              operationType: "pack",
              childIds: [],
            },
          },
          allIds: ["o1"],
          rootOperationId: "o1", // No operations reference t1, so it's "orphaned"
        },
      };
    });

    describe('is "orphaned" with selected columns', () => {
      beforeEach(() => {
        cy.mountWithProviders(<DeleteColumnsButton />, {
          preloadedState: localState,
        });
      });
      it("enables the button", () =>
        cy.get("button").should("not.be.disabled"));
    });

    describe("has no columns selected", () => {
      beforeEach(() => {
        cy.mountWithProviders(<DeleteColumnsButton />, {
          preloadedState: {
            ...localState,
            ui: {
              ...localState.ui,
              selectedColumnIds: [],
            },
          },
        });
      });
      it("disables the button", () => cy.get("button").should("be.disabled"));
    });

    describe("table is read-only", () => {
      beforeEach(() => {
        cy.mountWithProviders(<DeleteColumnsButton />, {
          preloadedState: {
            ui: {
              focusedObjectId: "t1",
            },
            operations: {
              rootOperationId: "o0", // Make o1 NOT the root operation (isReadOnly = true)
              allIds: ["o0", "o1"],
              byId: {
                o0: {
                  id: "o0",
                  childIds: ["o1", "t3"],
                },
                o1: {
                  parentId: "o0",
                  childIds: ["t1", "t2"],
                },
              },
              tables: {
                byId: {
                  t1: {
                    id: "t1",
                  },
                  t2: {
                    id: "t2",
                  },
                  t3: {
                    id: "t3",
                  },
                },
                allIds: ["t1", "t2", "t3"],
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
