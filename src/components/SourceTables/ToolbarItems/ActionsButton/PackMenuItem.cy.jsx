/* eslint-disable no-undef */
import { describe } from "node:test";
import {
  OPERATION_TYPE_PACK,
  OPERATION_TYPE_STACK,
} from "../../../../slices/operationsSlice";
import PackMenuItem from "./PackMenuItem";

const defaultState = {
  ui: {
    focusedObjectId: "o1",
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
    cy.mountWithProviders(
      <PackMenuItem onClick={onClick} selectedCount={1} />,
      {
        preloadedState: defaultState,
      },
    );
    cy.get("li").should("exist").click();
    cy.get("@onClick").should("have.been.called");
  });
  describe("text render", () => {
    it("should render the correct text when one table is selected", () => {
      cy.mountWithProviders(
        <PackMenuItem onClick={() => {}} selectedCount={1} />,
        {
          preloadedState: defaultState,
        },
      );
      cy.get("li").should("contain.text", "Pack table");
    });
    it("should render the correct text when multiple tables are selected", () => {
      cy.mountWithProviders(
        <PackMenuItem onClick={() => {}} selectedCount={2} />,
        {
          preloadedState: defaultState,
        },
      );
      cy.get("li").should("contain.text", "Pack tables");
    });
  });

  describe("is disabled when", () => {
    it("no tables are selected", () => {
      cy.mountWithProviders(
        <PackMenuItem onClick={() => {}} selectedCount={0} />,
        {
          preloadedState: defaultState,
        },
      );
      cy.get("li").should("have.attr", "aria-disabled", "true");
    });
    it("focusedObject is null", () => {
      cy.mountWithProviders(
        <PackMenuItem onClick={() => {}} selectedCount={1} />,
        {
          preloadedState: {
            ui: {
              focusedObjectId: null,
            },
          },
        },
      );
      cy.get("li").should("have.attr", "aria-disabled", "true");
    });
    it("focusedObject is a table", () => {
      cy.mountWithProviders(
        <PackMenuItem onClick={() => {}} selectedCount={1} />,
        {
          preloadedState: {
            ui: {
              focusedObjectId: "t1",
            },
            tables: {
              byId: {
                t1: { id: "t1" },
              },
              allIds: ["t1"],
            },
          },
        },
      );
      cy.get("li").should("have.attr", "aria-disabled", "true");
    });
    it("more than one table is selected", () => {
      cy.mountWithProviders(
        <PackMenuItem onClick={() => {}} selectedCount={2} />,
        {
          preloadedState: {
            ui: {
              focusedObjectId: "o1",
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
            },
          },
        },
      );
      cy.get("li").should("have.attr", "aria-disabled", "true");
    });
    it("focusedObject is not the root operation", () => {
      cy.mountWithProviders(
        <PackMenuItem onClick={() => {}} selectedCount={1} />,
        {
          preloadedState: {
            ui: {
              focusedObjectId: "o1",
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
        },
      );
      cy.get("li").should("have.attr", "aria-disabled", "true");
    });
  });
  describe("is enabled when", () => {
    it("exactly two tables are selected and the focusedObject is null", () => {
      cy.mountWithProviders(
        <PackMenuItem onClick={() => {}} selectedCount={2} />,
        {
          preloadedState: {
            ui: {
              focusedObjectId: null,
            },
          },
        },
      );
      cy.get("li").should("not.have.attr", "aria-disabled");
    });
    it("exactly 1 table is selected and the focusedObject is the root operation", () => {
      cy.mountWithProviders(
        <PackMenuItem onClick={() => {}} selectedCount={1} />,
        {
          preloadedState: {
            ui: {
              focusedObjectId: "o1",
            },
            operations: {
              byId: {
                o1: {
                  id: "o1",
                  operationType: OPERATION_TYPE_STACK,
                  childIds: ["t1"],
                },
              },
              allIds: ["o1"],
              rootOperationId: "o1",
            },
          },
        },
      );
      cy.get("li").should("not.have.attr", "aria-disabled");
    });
  });
});
