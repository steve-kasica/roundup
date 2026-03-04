/* eslint-disable no-undef */
import {
  OPERATION_TYPE_PACK,
  OPERATION_TYPE_STACK,
} from "../../../../slices/operationsSlice";
import AppendMenuItem from "./AppendMenuItem";

const defaultState = {
  ui: {
    focusedObjectId: "o1",
  },
  operations: {
    byId: {
      o1: { id: "o1", operationType: OPERATION_TYPE_STACK },
    },
    allIds: ["o1"],
  },
};

describe("AppendMenuItem", () => {
  it("should render the append menu item", () => {
    const onClick = cy.stub().as("onClick");
    cy.mountWithProviders(
      <AppendMenuItem onClick={onClick} selectedCount={1} />,
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
        <AppendMenuItem onClick={() => {}} selectedCount={1} />,
        {
          preloadedState: defaultState,
        },
      );
      cy.get("li").should("contain.text", "Insert table");
    });
    it("should render the correct text when multiple tables are selected", () => {
      cy.mountWithProviders(
        <AppendMenuItem onClick={() => {}} selectedCount={2} />,
        {
          preloadedState: defaultState,
        },
      );
      cy.get("li").should("contain.text", "Insert table");
    });
  });

  describe("is disabled when", () => {
    it("no tables are selected", () => {
      cy.mountWithProviders(
        <AppendMenuItem onClick={() => {}} selectedCount={0} />,
        {
          preloadedState: defaultState,
        },
      );
      cy.get("li").should("have.attr", "aria-disabled", "true");
    });
    it("focusedObject is null", () => {
      cy.mountWithProviders(
        <AppendMenuItem onClick={() => {}} selectedCount={1} />,
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
        <AppendMenuItem onClick={() => {}} selectedCount={1} />,
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
    it("focusedObject is a pack operation with two tables", () => {
      cy.mountWithProviders(
        <AppendMenuItem onClick={() => {}} selectedCount={2} />,
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
        <AppendMenuItem onClick={() => {}} selectedCount={1} />,
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
});
