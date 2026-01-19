/* eslint-disable no-undef */
import { updateOperationsRequest } from "../../../sagas/updateOperationsSaga/actions.js";
import ChangeTableOrder from "./ChangeTableOrder";
import { stackState, packState } from "./fixtures.js";

describe("ChangeTableOrder component", () => {
  it("should render the button", () => {});
  describe("Focused table", () => {
    beforeEach(() => {
      cy.mountWithProviders(<ChangeTableOrder />, {
        preloadedState: {
          ...packState,
          ui: {
            ...packState.ui,
            focusedObjectId: "t1", // Focus on table
          },
        },
      });
    });
    it("should be disabled", () => {
      cy.get("button").should("be.disabled");
    });
  });

  describe("Focused pack operation", () => {
    beforeEach(() => {
      cy.mountWithProviders(<ChangeTableOrder />, {
        preloadedState: packState,
      });
    });
    it("should be enabled", () => {
      cy.get("button").should("not.be.disabled");
    });
    it("should display swap arrows icon horizontally", () => {
      cy.get("svg").should("have.attr", "data-testid", "SwapHorizIcon");
    });

    it("should dispatch an updateOperationRequest action on click", () => {
      const dispatchSpy = cy.spy().as("dispatchSpy");
      cy.mountWithProviders(<ChangeTableOrder />, {
        preloadedState: packState,
        dispatchSpy,
      });
      cy.get("button").click();
      cy.get("@dispatchSpy").should("have.been.calledWithMatch", {
        type: updateOperationsRequest.type,
      });
    });
  });

  describe("Focused stack operation", () => {
    beforeEach(() => {
      cy.mountWithProviders(<ChangeTableOrder />, {
        preloadedState: stackState,
      });
    });
    it("should display swap arrows icon vertically", () => {
      cy.get("svg").should("have.attr", "data-testid", "SwapVertIcon");
    });
    it("should be disabled", () => {
      cy.get("button").should("be.disabled");
    });
  });
});
