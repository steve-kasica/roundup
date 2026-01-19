/* eslint-disable no-undef */
import DeleteColumnsButton from "./DeleteColumnsButton";
import { state } from "./fixtures.js";

describe("DeleteColumnsButton Component", () => {
  beforeEach(() => {
    cy.mountWithProviders(<DeleteColumnsButton />, {
      preloadedState: state,
    });
  });
  describe("Basic functionality", () => {
    it("renders the button", () => {
      cy.get("button").should("exist");
    });
  });

  describe("Focused object is a table", () => {
    const stateWithFocusedTable = {
      ...state,
      ui: {
        ...state.ui,
        focusedObjectId: "t1", // Focus on table
        selectedColumnIds: ["c1", "c2"], // Select its columns
      },
    };
    beforeEach(() => {
      cy.mountWithProviders(<DeleteColumnsButton />, {
        preloadedState: stateWithFocusedTable,
      });
    });

    it("enables the button when columns are selected", () => {
      cy.get("button").should("not.be.disabled");
    });

    it("disables the button when no columns are selected", () => {
      const stateWithNoSelectedColumns = {
        ...stateWithFocusedTable,
        ui: {
          ...stateWithFocusedTable.ui,
          selectedColumnIds: [],
        },
      };
      cy.mountWithProviders(<DeleteColumnsButton />, {
        preloadedState: stateWithNoSelectedColumns,
      });
      cy.get("button").should("be.disabled");
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
      cy.mountWithProviders(<DeleteColumnsButton />, {
        preloadedState: stateWithFocusedOperation,
      });
    });

    it("enables the button when columns are selected", () => {
      cy.get("button").should("not.be.disabled");
    });

    it("disables the button when no columns are selected", () => {
      const stateWithNoSelectedColumns = {
        ...stateWithFocusedOperation,
        ui: {
          ...stateWithFocusedOperation.ui,
          selectedColumnIds: [],
        },
      };
      cy.mountWithProviders(<DeleteColumnsButton />, {
        preloadedState: stateWithNoSelectedColumns,
      });
      cy.get("button").should("be.disabled");
    });
  });
});

//   describe("Functionality", () => {
//     describe("")
//     it("dispatches a deleteColumnsRequest action on confirmation", () => {
//       const spy = cy.spy();
//       cy.mountWithProviders(<DeleteColumnsButton />, {
//         preloadedState: state,
//         dispatchSpy: spy,
//       });
//       cy.get("button").click();
//       cy.get("[role='dialog']").should("be.visible");
//       cy.contains("button", "Delete").click();
//       cy.wrap(spy).should("have.been.calledWithMatch", {
//         type: "sagas/deleteColumns/request",
//         payload: {
//           columnIds: ["c1", "c2"],
//         },
//       });
//     });
//   });
// });
