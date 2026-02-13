/* eslint-disable no-undef */
import {
  OPERATION_TYPE_PACK,
  OPERATION_TYPE_STACK,
} from "../../../../slices/operationsSlice";
import PackMenuItem from "./PackMenuItem";

const defaultState = {
  ui: {
    focusedObjectId: "o1",
    selectedTableIds: ["t1"],
  },
  operations: {
    byId: {
      o1: { id: "o1", operationType: OPERATION_TYPE_STACK },
    },
    rootOperationId: "o1",
    allIds: ["o1"],
  },
};

describe("PackMenuItem", () => {
  it("should render the pack menu item", () => {
    const onClick = cy.stub().as("onClick");
    cy.mountWithProviders(<PackMenuItem onClick={onClick} />, {
      preloadedState: defaultState,
    });
    cy.get("li").should("exist").click();
    cy.get("@onClick").should("have.been.called");
  });
  describe("text render", () => {
    it("should render the correct text when one table is selected", () => {
      cy.mountWithProviders(<PackMenuItem onClick={() => {}} />, {
        preloadedState: defaultState,
      });
      cy.get("li").should("contain.text", "Pack table");
    });
    it("should render the correct text when multiple tables are selected", () => {
      cy.mountWithProviders(<PackMenuItem onClick={() => {}} />, {
        preloadedState: {
          ...defaultState,
          ui: {
            ...defaultState.ui,
            selectedTableIds: ["t1", "t2"],
          },
        },
      });
      cy.get("li").should("contain.text", "Pack tables");
    });
  });

  describe("is disabled when", () => {
    it("no tables are selected", () => {
      cy.mountWithProviders(<PackMenuItem onClick={() => {}} />, {
        preloadedState: {
          ...defaultState,
          ui: {
            ...defaultState.ui,
            selectedTableIds: [],
          },
        },
      });
      cy.get("li").should("have.attr", "aria-disabled", "true");
    });

    it("the root operation is defined and more than one table is selected", () => {
      cy.mountWithProviders(<PackMenuItem onClick={() => {}} />, {
        preloadedState: {
          ui: {
            focusedObjectId: "o1",
            selectedTableIds: ["t1", "t2"],
          },
          operations: {
            byId: {
              o1: {
                id: "o1",
                operationType: OPERATION_TYPE_PACK,
                childIds: ["t1", "t2"],
              },
            },
            allIds: ["o1"],
            rootOperationId: "o1",
          },
        },
      });
      cy.get("li").should("have.attr", "aria-disabled", "true");
    });
    it("focusedObject is not the root operation", () => {
      cy.mountWithProviders(<PackMenuItem onClick={() => {}} />, {
        preloadedState: {
          ui: {
            focusedObjectId: "o1",
            selectedTableIds: ["t1"],
          },
          operations: {
            byId: {
              o1: {
                id: "o1",
                operationType: OPERATION_TYPE_STACK,
                childIds: ["t1"],
              },
              o2: {
                id: "o2",
                operationType: OPERATION_TYPE_STACK,
                childIds: ["t2"],
              },
            },
            allIds: ["o1", "o2"],
            rootOperationId: "o2",
          },
        },
      });
      cy.get("li").should("have.attr", "aria-disabled", "true");
    });
  });
  describe("is enabled when", () => {
    it("exactly 2 table is selected and rootOperationId is null", () => {
      cy.mountWithProviders(<PackMenuItem onClick={() => {}} />, {
        preloadedState: {
          ui: {
            focusedObjectId: null,
            selectedTableIds: ["t1", "t2"],
          },
          operations: {
            byId: {},
            allIds: [],
            rootOperationId: null,
          },
        },
      });
      cy.get("li").should("not.have.attr", "aria-disabled");
    });
    it("exactly 1 table is selected and rootOperationId is not null", () => {
      cy.mountWithProviders(<PackMenuItem onClick={() => {}} />, {
        preloadedState: {
          ui: {
            focusedObjectId: "o1",
            selectedTableIds: ["t3"],
          },
          operations: {
            byId: {
              o1: {
                id: "o1",
                operationType: OPERATION_TYPE_PACK,
                childIds: ["t1", "t2"],
              },
            },
            allIds: ["o1"],
            rootOperationId: "o1",
          },
          tables: {
            byId: {
              t1: { id: "t1" },
              t2: { id: "t2" },
              t3: { id: "t3" },
            },
            allIds: ["t1", "t2", "t3"],
          },
        },
      });
      cy.get("li").should("not.have.attr", "aria-disabled");
    });
  });
});
