/* eslint-disable no-undef */
import {
  MATCH_TYPE_LEFT_UNMATCHED,
  MATCH_TYPE_MATCHES,
  MATCH_TYPE_RIGHT_UNMATCHED,
  OPERATION_TYPE_PACK,
} from "../../../slices/operationsSlice/Operation.js";
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

  describe("Focused object is a stack operation", () => {
    const stateWithFocusedOperation = {
      ...state,
      ui: {
        ...state.ui,
        focusedObjectId: "o1", // Focus on stack operation
      },
      operations: {
        byId: {
          o1: {
            id: "o1",
            type: "stack",
            childIds: ["t1", "t2"],
            columnIds: ["c1", "c2", "c3", "c46", "c47"],
          },
        },
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
  describe("Focused object is a pack operation", () => {
    describe("selection is empty", () => {
      beforeEach(() => {
        cy.mountWithProviders(<SelectAllColumnsButton />, {
          preloadedState: {
            ui: {
              selectedColumnIds: [],
              selectedMatches: [],
              focusedObjectId: "o1", // Focus on pack operation
            },
            operations: {
              byId: {
                o1: {
                  id: "o1",
                  operationType: OPERATION_TYPE_PACK,
                  childIds: ["t1", "t2"],
                  columnIds: ["c48", "c49", "c50", "c51", "c52"],
                },
              },
            },
            tables: {
              byId: {
                t1: { id: "t1", columnIds: ["c1", "c2", "c3"] },
                t2: { id: "t2", columnIds: ["c46", "c47"] },
              },
            },
          },
        });
      });
      it("enables the button", () => {
        cy.get("button").should("not.be.disabled");
      });
      it("on click selects all child columnIds", () => {
        cy.get("button").click();
        cy.getState()
          .its("ui.selectedColumnIds")
          .should("deep.equal", ["c1", "c2", "c3", "c46", "c47"]);
      });
      it("on click selects all match types", () => {
        cy.get("button").click();
        cy.getState()
          .its("ui.selectedMatches")
          .should("deep.equal", [
            MATCH_TYPE_LEFT_UNMATCHED,
            MATCH_TYPE_MATCHES,
            MATCH_TYPE_RIGHT_UNMATCHED,
          ]);
      });
    });
    describe("selection is not empty", () => {
      beforeEach(() => {
        cy.mountWithProviders(<SelectAllColumnsButton />, {
          preloadedState: {
            ui: {
              selectedColumnIds: ["c1", "c2"],
              selectedMatches: [MATCH_TYPE_MATCHES],
              focusedObjectId: "o1", // Focus on pack operation
            },
            operations: {
              byId: {
                o1: {
                  id: "o1",
                  operationType: OPERATION_TYPE_PACK,
                  childIds: ["t1", "t2"],
                  columnIds: ["c1", "c2", "c3", "c46", "c47"],
                },
              },
            },
          },
        });
      });
      it("enables the button", () => {
        cy.get("button").should("not.be.disabled");
      });
      it("on click deselects all child columnIds", () => {
        cy.get("button").click();
        cy.getState().its("ui.selectedColumnIds").should("deep.equal", []);
      });
      it("on click deselects all match types", () => {
        cy.get("button").click();
        cy.getState().its("ui.selectedMatches").should("deep.equal", []);
      });
    });
  });
});
