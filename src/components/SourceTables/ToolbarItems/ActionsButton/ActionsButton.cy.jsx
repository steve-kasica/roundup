/* eslint-disable no-undef */
import ActionsButton from "./ActionsButton";

const defaultState = {
  ui: {
    focusedObjectId: null,
    selectedTableIds: [],
  },
  operations: {
    byId: {
      o1: {
        id: "o1",
        isMaterialized: true,
        isInSync: true,
      },
    },
    allIds: ["o1"],
    rootOperationId: "o1",
  },
  tables: {
    byId: {
      t1: { id: "t1" },
    },
    allIds: ["t1"],
  },
};

describe("ActionsButton", () => {
  it("should render the actions button", () => {
    cy.mountWithProviders(<ActionsButton />, { preloadedState: defaultState });
    cy.get("button").should("exist");
  });

  describe("The button is disabled", () => {
    it("when there are no selected tables", () => {
      cy.mountWithProviders(<ActionsButton />, {
        preloadedState: {
          ...defaultState,
          ui: {
            ...defaultState.ui,
            focusedObjectId: "o1",
            selectedTableIds: [],
          },
        },
      });
      cy.get("button").should("be.disabled");
    });
    it("when the focused object is a table", () => {
      cy.mountWithProviders(<ActionsButton />, {
        preloadedState: {
          ...defaultState,
          ui: {
            ...defaultState.ui,
            focusedObjectId: "t1",
            selectedTableIds: ["t2"],
          },
        },
      });
      cy.get("button").should("be.disabled");
    });
    it("when the focused object is not materialized", () => {
      cy.mountWithProviders(<ActionsButton />, {
        preloadedState: {
          ...defaultState,
          ui: {
            ...defaultState.ui,
            focusedObjectId: "o1",
            selectedTableIds: ["t1"],
          },
          operations: {
            ...defaultState.operations,
            byId: {
              ...defaultState.operations.byId,
              o1: {
                id: "o1",
                isMaterialized: false,
                isInSync: true,
              },
            },
          },
        },
      });
      cy.get("button").should("be.disabled");
    });

    it("when the focused object is out of sync", () => {
      cy.mountWithProviders(<ActionsButton />, {
        preloadedState: {
          ...defaultState,
          ui: {
            ...defaultState.ui,
            focusedObjectId: "o1",
            selectedTableIds: ["t1"],
          },
          operations: {
            ...defaultState.operations,
            byId: {
              ...defaultState.operations.byId,
              o1: {
                id: "o1",
                isMaterialized: true,
                isInSync: false,
              },
            },
          },
        },
      });
      cy.get("button").should("be.disabled");
    });
  });

  describe("The button is enabled", () => {
    it("when there are selected tables and focused object is a materialized, in-sync operation", () => {
      cy.mountWithProviders(<ActionsButton />, {
        preloadedState: {
          ...defaultState,
          ui: {
            ...defaultState.ui,
            focusedObjectId: "o1",
            selectedTableIds: ["t1"],
          },
          operations: {
            ...defaultState.operations,
            byId: {
              ...defaultState.operations.byId,
              o1: {
                id: "o1",
                isMaterialized: true,
                isInSync: true,
              },
            },
          },
        },
      });
      cy.get("button").should("be.enabled");
    });
    it("When the app is in the initial state", () => {
      // We know the app is in the initial state when the rootOperationId is null
      cy.mountWithProviders(<ActionsButton />, {
        preloadedState: {
          ...defaultState,
          ui: {
            ...defaultState.ui,
            focusedObjectId: null,
            selectedTableIds: ["t1"],
          },
          operations: {
            ...defaultState.operations,
            rootOperationId: null,
          },
        },
      });
      cy.get("button").should("be.enabled");
    });
  });
});
