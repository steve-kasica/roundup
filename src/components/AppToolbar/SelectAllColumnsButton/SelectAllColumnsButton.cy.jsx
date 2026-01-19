/* eslint-disable no-undef */
import SelectAllColumnsButton from "./SelectAllColumnsButton";
import { state } from "./fixtures.js";

describe("SelectAllColumnsButton Component", () => {
  beforeEach(() => {
    cy.mountWithProviders(<SelectAllColumnsButton />, {
      preloadedState: state,
    });
  });

  describe("Basic functionality", () => {
    it("renders the button", () => {
      cy.get("button").should("exist");
    });

    it("disables the button when no focused object", () => {
      const stateWithNoFocus = {
        ...state,
        ui: {
          ...state.ui,
          focusedObjectId: null,
        },
      };
      cy.mountWithProviders(<SelectAllColumnsButton />, {
        preloadedState: stateWithNoFocus,
      });
      cy.get("button").should("be.disabled");
    });

    it("displays a select all icon when no columns are selected", () => {
      cy.get("button")
        .find("svg")
        .should("have.attr", "data-testid", "SelectAllIcon");
    });

    it("displays a deselect icon when some columns are selected", () => {
      const stateWithSelectedColumns = {
        ...state,
        ui: {
          ...state.ui,
          selectedColumnIds: ["c1", "c2"],
        },
      };
      cy.mountWithProviders(<SelectAllColumnsButton />, {
        preloadedState: stateWithSelectedColumns,
      });
      cy.get("button")
        .find("svg")
        .should("have.attr", "data-testid", "DeselectIcon");
    });
  });

  describe("Focused object is a table", () => {
    const stateWithFocusedTable = {
      ...state,
      ui: {
        ...state.ui,
        focusedObjectId: "t1", // Focus on table
      },
    };
    beforeEach(() => {
      cy.mountWithProviders(<SelectAllColumnsButton />, {
        preloadedState: stateWithFocusedTable,
      });
    });

    it("enables the button", () => {
      cy.get("button").should("not.be.disabled");
    });

    it("selects all columns on click when none are selected", () => {
      cy.get("button").click();
      cy.getState()
        .its("ui.selectedColumnIds")
        .should("deep.equal", ["c1", "c2", "c3"]);
    });

    it("deselects all columns on click when some are selected", () => {
      const stateWithSomeSelectedColumns = {
        ...stateWithFocusedTable,
        ui: {
          ...stateWithFocusedTable.ui,
          selectedColumnIds: ["c1"],
        },
      };
      cy.mountWithProviders(<SelectAllColumnsButton />, {
        preloadedState: stateWithSomeSelectedColumns,
      });
      cy.get("button").click();
      cy.getState().its("ui.selectedColumnIds").should("deep.equal", []);
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
      cy.mountWithProviders(<SelectAllColumnsButton />, {
        preloadedState: stateWithFocusedOperation,
      });
    });
    it("enables the button", () => {
      cy.get("button").should("not.be.disabled");
    });

    it("selects all child columns on click when none are selected", () => {
      cy.get("button").click();
      cy.getState()
        .its("ui.selectedColumnIds")
        .should("deep.equal", ["c1", "c2", "c3", "c46", "c47"]);
    });

    it("deselects all child columns on click when some are selected", () => {
      const stateWithSomeSelectedColumns = {
        ...stateWithFocusedOperation,
        ui: {
          ...stateWithFocusedOperation.ui,
          selectedColumnIds: ["c1"],
        },
      };
      cy.mountWithProviders(<SelectAllColumnsButton />, {
        preloadedState: stateWithSomeSelectedColumns,
      });
      cy.get("button").click();
      cy.getState().its("ui.selectedColumnIds").should("deep.equal", []);
    });
  });
});
