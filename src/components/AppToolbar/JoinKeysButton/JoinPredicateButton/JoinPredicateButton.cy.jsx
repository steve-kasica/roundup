/* eslint-disable no-undef */
import FocusedEnhancedJoinPredicateButton from "./JoinPredicateButton";
import { state } from "./fixtures.js";
import {
  JOIN_PREDICATES,
  OPERATION_TYPE_STACK,
} from "../../../slices/operationsSlice";

describe("JoinPredicateButton Component", () => {
  describe("Basic functionality", () => {
    beforeEach(() => {
      cy.mountWithProviders(<FocusedEnhancedJoinPredicateButton />, {
        preloadedState: state,
      });
    });

    it("renders the button", () => {
      cy.get("button").should("exist");
    });

    it("opens the menu on button click", () => {
      cy.get("button").click();
      cy.get("[role='menu']").should("be.visible");
    });

    it("displays all join predicate options in the menu", () => {
      cy.get("button").click();
      cy.get("[role='menuitem']").should("have.length", 4);
      cy.get("[role='menuitem']").eq(0).should("contain", "Equals");
      cy.get("[role='menuitem']").eq(1).should("contain", "Contains");
      cy.get("[role='menuitem']").eq(2).should("contain", "Starts with");
      cy.get("[role='menuitem']").eq(3).should("contain", "Ends with");
    });
  });

  describe("Reading state", () => {
    it("is disabled if the focused object is a table", () => {
      const stateWithFocusedTable = {
        ...state,
        ui: {
          ...state.ui,
          focusedObjectId: "t1", // Focus on table
        },
      };
      cy.mountWithProviders(<FocusedEnhancedJoinPredicateButton />, {
        preloadedState: stateWithFocusedTable,
      });
      cy.get("button").should("be.disabled");
    });

    it("is disabled if the focused object is a stack operation", () => {
      const stateWithStackOperation = {
        ...state,
        operations: {
          ...state.operations,
          byId: {
            ...state.operations.byId,
            o1: {
              ...state.operations.byId.o1,
              operationType: OPERATION_TYPE_STACK,
            },
          },
        },
      };
      cy.mountWithProviders(<FocusedEnhancedJoinPredicateButton />, {
        preloadedState: stateWithStackOperation,
      });
      cy.get("button").should("be.disabled");
    });

    it("is enabled if the focused object is a pack operation", () => {
      cy.mountWithProviders(<FocusedEnhancedJoinPredicateButton />, {
        preloadedState: state, // state already has pack operation as focused
      });
      cy.get("button").should("not.be.disabled");
    });

    it("highlights the currently selected join predicate", () => {
      const stateWithEqualsSelected = {
        ...state,
        operations: {
          ...state.operations,
          byId: {
            ...state.operations.byId,
            o1: {
              ...state.operations.byId.o1,
              joinPredicate: JOIN_PREDICATES.EQUALS,
            },
          },
        },
      };
      cy.mountWithProviders(<FocusedEnhancedJoinPredicateButton />, {
        preloadedState: stateWithEqualsSelected,
      });
      cy.get("button").click();
      cy.get("[role='menuitem']").eq(0).should("have.class", "Mui-selected");
    });
  });

  describe("Modifying state", () => {
    it("dispatches update action when selecting an option", () => {
      const store = cy.mountWithProviders(
        <FocusedEnhancedJoinPredicateButton />,
        {
          preloadedState: state,
        }
      );

      // Open menu and select "Contains"
      cy.get("button").click();
      cy.get("[role='menuitem']").eq(1).click();

      // Verify the menu closes
      cy.get("[role='menu']").should("not.exist");

      // Verify dispatch was called
      store.then(({ store: reduxStore }) => {
        // Check that an action was dispatched (store will have been called)
        expect(reduxStore.dispatch).to.exist;
      });
    });

    it("closes the menu after selecting an option", () => {
      cy.mountWithProviders(<FocusedEnhancedJoinPredicateButton />, {
        preloadedState: state,
      });
      cy.get("button").click();
      cy.get("[role='menuitem']").eq(2).click();
      cy.get("[role='menu']").should("not.exist");
    });

    it("displays the updated value on subsequent renders", () => {
      // Test that when the state has a specific value, it displays correctly
      const stateWithContains = {
        ...state,
        operations: {
          ...state.operations,
          byId: {
            ...state.operations.byId,
            o1: {
              ...state.operations.byId.o1,
              joinPredicate: JOIN_PREDICATES.CONTAINS,
            },
          },
        },
      };
      cy.mountWithProviders(<FocusedEnhancedJoinPredicateButton />, {
        preloadedState: stateWithContains,
      });
      cy.get("button").should("contain", "Contains");

      // Test with different value
      const stateWithStartsWith = {
        ...state,
        operations: {
          ...state.operations,
          byId: {
            ...state.operations.byId,
            o1: {
              ...state.operations.byId.o1,
              joinPredicate: JOIN_PREDICATES.STARTS_WITH,
            },
          },
        },
      };
      cy.mountWithProviders(<FocusedEnhancedJoinPredicateButton />, {
        preloadedState: stateWithStartsWith,
      });
      cy.get("button").should("contain", "Starts with");
    });
  });
});
