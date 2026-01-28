/* eslint-disable no-undef */
import OperationSelect from "./OperationSelect";
import { state } from "./fixtures";

describe("OperationSelect", () => {
  describe("Focused Object is an operation", () => {
    beforeEach(() => {
      const onChangeSpy = cy.spy().as("onChangeSpy");
      cy.mountWithProviders(
        <OperationSelect focusedObjectId="o3" onChange={onChangeSpy} />,
        {
          preloadedState: {
            ...state,
            ui: { ...state.ui, focusedObjectId: "o3" },
          },
        },
      );
    });
    it("renders the select component", () => {
      cy.get(".OperationSelect").should("exist");
    });
    it("has the focused operation selected", () => {
      cy.get(".OperationSelect input").should("have.value", "o3");
    });
    it("lists all operations in the dropdown", () => {
      cy.get(".OperationSelect").click();
      cy.get("ul[role=listbox]").within(() => {
        cy.get("li").should("have.length", 3);
        cy.get("li").eq(0).should("have.attr", "data-value", "o3");
        cy.get("li").eq(1).should("have.attr", "data-value", "o2");
        cy.get("li").eq(2).should("have.attr", "data-value", "o1");
      });
    });
    describe("on changing selection", () => {
      it("calls onChange with the new operation ID", () => {
        cy.get(".OperationSelect").click();
        cy.get("ul[role=listbox] li").eq(2).click();
        cy.get("@onChangeSpy").should("have.been.calledOnce");
        cy.get("@onChangeSpy").should("have.been.calledWith", "o1");
      });
    });
  });
  describe("Focused Object is NOT an operation", () => {
    beforeEach(() => {
      const onChangeSpy = cy.spy().as("onChangeSpy");
      cy.mountWithProviders(
        <OperationSelect focusedObjectId={"t1"} onChange={onChangeSpy} />,
        {
          preloadedState: { ...state, ui: { focusedObjectId: "t1" } },
        },
      );
    });
    it("renders the select component", () => {
      cy.get(".OperationSelect").should("exist");
    });
    it("has the focused operation selected", () => {
      cy.get(".OperationSelect input").should("have.value", "");
    });
    describe("on changing selection", () => {
      it("calls onChange with the new operation ID", () => {
        cy.get(".OperationSelect").click();
        cy.get("ul[role=listbox] li").eq(2).click();
        cy.get("@onChangeSpy").should("have.been.calledOnce");
        cy.get("@onChangeSpy").should("have.been.calledWith", "o1");
      });
    });
  });
});
