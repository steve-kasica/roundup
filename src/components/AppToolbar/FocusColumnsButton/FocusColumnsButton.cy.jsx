/* eslint-disable no-undef */
import FocusedColumnsButton from ".";
import { state } from "./fixtures";

describe("FocusColumnsButton Component", () => {
  describe("Basic functionality", () => {
    beforeEach(() => {
      cy.mountWithProviders(<FocusedColumnsButton />, {
        preloadedState: state,
      });
    });

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
      cy.mountWithProviders(<FocusedColumnsButton />, {
        preloadedState: stateWithNoFocus,
      });
      cy.get("button").should("be.disabled");
    });
  });

  describe("Only one column within table and index is selected", () => {
    beforeEach(() => {
      const stateWithOneColumnSelected = {
        ...state,
        ui: {
          ...state.ui,
          selectedColumnIds: ["c1"],
        },
      };
      cy.mountWithProviders(<FocusedColumnsButton />, {
        preloadedState: stateWithOneColumnSelected,
      });
    });
    it("enables the button", () => {
      cy.get("button").should("not.be.disabled");
    });
    it("clicking the button sets the selected columns in the focused ColumnIds state", () => {
      cy.get("button").click();
      cy.getState().then((state) => {
        const focusedColumnIds = state.ui.focusedColumnIds;
        expect(focusedColumnIds).to.deep.equal(["c1"]);
      });
    });
  });

  describe("When multiple columns within table and between index are selected", () => {
    beforeEach(() => {
      const stateWithMultipleColumnsSelected = {
        ...state,
        ui: {
          ...state.ui,
          selectedColumnIds: ["c1", "c2"],
        },
      };
      cy.mountWithProviders(<FocusedColumnsButton />, {
        preloadedState: stateWithMultipleColumnsSelected,
      });
    });
    it("disables the button", () => {
      cy.get("button").should("be.disabled");
    });
  });

  describe("When multiple columns between tables but within index are selected", () => {
    beforeEach(() => {
      const stateWithMultipleTableColumnsSelected = {
        ...state,
        ui: {
          ...state.ui,
          selectedColumnIds: ["c1", "c46"],
        },
      };
      cy.mountWithProviders(<FocusedColumnsButton />, {
        preloadedState: stateWithMultipleTableColumnsSelected,
      });
    });
    it("enables the button", () => {
      cy.get("button").should("not.be.disabled");
    });
    it("clicking the button sets the selected columns in the focused ColumnIds state", () => {
      cy.get("button").click();
      cy.getState().then((state) => {
        const focusedColumnIds = state.ui.focusedColumnIds;
        expect(focusedColumnIds).to.deep.equal(["c1", "c46"]);
      });
    });
  });

  describe("When multiple columns between tables and between indexes are selected", () => {
    beforeEach(() => {
      const stateWithMultipleIndexesColumnsSelected = {
        ...state,
        ui: {
          ...state.ui,
          selectedColumnIds: ["c1", "c47"],
        },
      };
      cy.mountWithProviders(<FocusedColumnsButton />, {
        preloadedState: stateWithMultipleIndexesColumnsSelected,
      });
    });
    it("disables the button", () => {
      cy.get("button").should("be.disabled");
    });
  });
});
