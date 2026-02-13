/* eslint-disable no-undef */

import { OPERATION_TYPE_STACK } from "../../../../slices/operationsSlice";
import StackMenuItem from "./StackMenuItem";

describe("StackMenuItem", () => {
  it("should render the stack menu item", () => {
    const onClick = cy.stub().as("onClick");
    cy.mountWithProviders(<StackMenuItem onClick={onClick} />, {
      preloadedState: {
        ui: {
          focusedObjectId: "o1",
          selectedTableIds: ["t1", "t2"],
        },
        operations: {
          byId: {
            o1: { id: "o1", operationType: OPERATION_TYPE_STACK },
          },
          allIds: ["o1"],
          rootOperationId: "o1",
        },
      },
    });
    cy.get("li").should("exist").click();
    cy.get("@onClick").should("have.been.called");
  });
  describe("text render", () => {
    it("should render the correct text when one table is selected", () => {
      cy.mountWithProviders(<StackMenuItem onClick={() => {}} />, {
        preloadedState: {
          ui: {
            focusedObjectId: "o1",
            selectedTableIds: ["t1"],
          },
          tables: {
            byId: {
              t1: { id: "t1" },
            },
            allIds: ["t1"],
          },
          operations: {
            byId: {
              o1: { id: "o1", operationType: OPERATION_TYPE_STACK },
            },
            allIds: ["o1"],
            rootOperationId: "o1",
          },
        },
      });
      cy.get("li").should("contain.text", "Stack table");
    });
    it("should render the correct text when multiple tables are selected", () => {
      cy.mountWithProviders(<StackMenuItem onClick={() => {}} />, {
        preloadedState: {
          ui: {
            focusedObjectId: "o1",
            selectedTableIds: ["t1", "t2"],
          },
          tables: {
            byId: {
              t1: { id: "t1" },
              t2: { id: "t2" },
            },
            allIds: ["t1", "t2"],
          },
          operations: {
            byId: {
              o1: { id: "o1", operationType: OPERATION_TYPE_STACK },
            },
            allIds: ["o1"],
            rootOperationId: "o1",
          },
        },
      });
      cy.get("li").should("contain.text", "Stack tables");
    });
  });
  describe("is disabled when", () => {
    it("no tables are selected", () => {
      cy.mountWithProviders(<StackMenuItem onClick={() => {}} />, {
        preloadedState: {
          ui: {
            focusedObjectId: "o1",
            selectedTableIds: [],
          },
          operations: {
            byId: {
              o1: { id: "o1", operationType: OPERATION_TYPE_STACK },
            },
            allIds: ["o1"],
            rootOperationId: "o1",
          },
        },
      });
      cy.get("li").should("have.attr", "aria-disabled", "true");
    });
  });

  describe("is enabled when", () => {
    it("at least two tables are selected and root operation is null", () => {
      cy.mountWithProviders(<StackMenuItem onClick={() => {}} />, {
        preloadedState: {
          ui: {
            focusedObjectId: "t1",
            selectedTableIds: ["t1", "t2"],
          },
          operations: {
            byId: {},
            allIds: [],
            rootOperationId: null,
          },
          tables: {
            byId: {
              t1: { id: "t1" },
              t2: { id: "t2" },
            },
            allIds: ["t1", "t2"],
          },
        },
      });
      cy.get("li").should("not.have.attr", "aria-disabled", "true");
    });
    it("one table is selected and the focused object is the root operation", () => {
      cy.mountWithProviders(<StackMenuItem onClick={() => {}} />, {
        preloadedState: {
          ui: {
            focusedObjectId: "o1",
            selectedTableIds: ["t1"],
          },
          operations: {
            byId: {
              o1: { id: "o1", operationType: OPERATION_TYPE_STACK },
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
        },
      });
      cy.get("li").should("not.have.attr", "aria-disabled", "true");
    });
  });
});
