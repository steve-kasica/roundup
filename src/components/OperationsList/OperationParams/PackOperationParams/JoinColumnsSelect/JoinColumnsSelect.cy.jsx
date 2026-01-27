/* eslint-disable no-undef */

import JoinColumnsSelect from "./JoinColumnsSelect";
import { state } from "./fixtures";

const testOptionsMenu = () => {
  const expectedOptionsCount =
    state.tables.byId.t1.columnIds.length *
      state.tables.byId.t2.columnIds.length +
    1; // One for the header
  describe("The options menu", () => {
    beforeEach(() => {
      cy.get("div.MuiInputBase-root").click();
    });

    it("should open the select options on click", () => {
      cy.get("ul[role=listbox]").should("exist");
    });

    it("should have the correct options", () => {
      cy.get("ul[role=listbox]").within(() => {
        cy.get("li").should("have.length", expectedOptionsCount);
      });
    });

    it("should call onChange with the correct values when an option is selected", () => {
      cy.get("li[data-value='c1|c5']").click();
      cy.get("@onChangeSpy").should("have.been.calledOnce");
      cy.get("@onChangeSpy").should("have.been.calledWith", "c1", "c5");
    });
  });
};

describe("JoinColumnsSelect", () => {
  describe("Both keys are selected", () => {
    beforeEach(() => {
      cy.mountWithProviders(
        <JoinColumnsSelect
          id="o1"
          leftTableId="t1"
          rightTableId="t2"
          leftColumnIds={state.tables.byId.t1.columnIds}
          rightColumnIds={state.tables.byId.t2.columnIds}
          leftKeyId="c1"
          rightKeyId="c4"
          onChange={cy.spy().as("onChangeSpy")}
        />,
        {
          preloadedState: { ...state },
        },
      );
    });
    it("should render", () => {
      cy.get(".JoinColumnsSelect").should("exist");
    });
    it("should have the correct initial selection value", () => {
      cy.get("input").should("have.value", "c1|c4");
    });

    testOptionsMenu();
  });

  describe("When left key and right key are undefined", () => {
    beforeEach(() => {
      cy.mountWithProviders(
        <JoinColumnsSelect
          id="o1"
          leftTableId="t1"
          rightTableId="t2"
          leftColumnIds={state.tables.byId.t1.columnIds}
          rightColumnIds={state.tables.byId.t2.columnIds}
          onChange={cy.spy().as("onChangeSpy")}
        />,
        {
          preloadedState: { ...state },
        },
      );
    });
    it("should render", () => {
      cy.get(".JoinColumnsSelect").should("exist");
    });
    it("should have no selection", () => {
      cy.get("input").should("have.value", "");
    });
    testOptionsMenu();
  });
});
