/* eslint-disable no-undef */

import FocusedEnhancedJoinPredicateButton from "./JoinKeysButton";
import { state, nestedOperationState } from "./fixtures";

describe("JoinKeysButton", () => {
  let localState = { ...state };
  describe("No focused object", () => {
    beforeEach(() => {
      localState = {
        ...state,
        ui: {
          ...state.ui,
          focusedObjectId: null,
        },
      };
      cy.mountWithProviders(<FocusedEnhancedJoinPredicateButton />, {
        preloadedState: localState,
      });
    });
    it("should be disabled", () => {
      cy.get("button").should("be.disabled");
    });
  });
  describe("Focused object is a table", () => {
    beforeEach(() => {
      localState = {
        ...state,
        ui: {
          ...state.ui,
          focusedObjectId: "t1",
        },
      };
      cy.mountWithProviders(<FocusedEnhancedJoinPredicateButton />, {
        preloadedState: localState,
      });
    });
    it("should be disabled", () => {
      cy.get("button").should("be.disabled");
    });
  });
  //   describe("Focused object is a stack operation", () => {
  //     it("should be disabled", () => {});
  //   });
  describe("Focused object is a pack operation", () => {
    beforeEach(() => {
      localState = {
        ...state,
      };
      cy.mountWithProviders(<FocusedEnhancedJoinPredicateButton />, {
        preloadedState: localState,
      });
    });
    it("should be enabled", () => {
      cy.get("button").should("not.be.disabled");
    });
    describe("No join keys set", () => {
      beforeEach(() => {
        localState = {
          ...state,
          operations: {
            ...state.operations,
            byId: {
              ...state.operations.byId,
              op1: {
                ...state.operations.byId.op1,
                joinKey1: null,
                joinKey2: null,
              },
            },
          },
        };
        cy.mountWithProviders(<FocusedEnhancedJoinPredicateButton />, {
          preloadedState: localState,
        });
      });
      it.skip("should show 'Pack parameters' text", () => {
        cy.get("button").contains("Pack parameters");
      });
    });
    describe("Only left key set", () => {
      beforeEach(() => {
        localState = {
          ...state,
          operations: {
            ...state.operations,
            byId: {
              ...state.operations.byId,
              op1: {
                ...state.operations.byId.op1,
                joinKey1: "c3",
                joinKey2: null,
              },
            },
          },
        };
        cy.mountWithProviders(<FocusedEnhancedJoinPredicateButton />, {
          preloadedState: localState,
        });
      });
      it("should show left key name and empty right key", () => {
        cy.get("button").contains("DATE");
      });
    });
    describe("Only right key set", () => {
      beforeEach(() => {
        localState = {
          ...state,
          operations: {
            ...state.operations,
            byId: {
              ...state.operations.byId,
              op1: {
                ...state.operations.byId.op1,
                joinKey1: null,
                joinKey2: "c4",
              },
            },
          },
        };
        cy.mountWithProviders(<FocusedEnhancedJoinPredicateButton />, {
          preloadedState: localState,
        });
      });
      it.skip("should show empty left key and right key name", () => {
        cy.get("button").contains("PRCP");
      });
    });
    describe("Both keys set", () => {
      beforeEach(() => {
        localState = {
          ...state,
          operations: {
            ...state.operations,
            byId: {
              ...state.operations.byId,
              op1: {
                ...state.operations.byId.op1,
                joinKey1: "c3",
                joinKey2: "c4",
              },
            },
          },
        };
        cy.mountWithProviders(<FocusedEnhancedJoinPredicateButton />, {
          preloadedState: localState,
        });
      });
      it.skip("should show both key names", () => {
        cy.get("button").contains("c3");
        cy.get("button").contains("c4");
      });
    });
    it("should open menu on click", () => {
      cy.get("button").click();
      cy.get("ul[role='menu']").should("exist");
    });
  });

  describe("Focused object has other operations as children", () => {
    beforeEach(() => {
      localState = {
        ...nestedOperationState,
      };
      cy.mountWithProviders(<FocusedEnhancedJoinPredicateButton />, {
        preloadedState: localState,
      });
    });
    it("should be enabled", () => {
      cy.get("button").should("not.be.disabled");
    });
    it("should open menu on click", () => {
      cy.get("button").click();
      cy.get("ul[role='menu']").should("exist");
    });
  });
});
