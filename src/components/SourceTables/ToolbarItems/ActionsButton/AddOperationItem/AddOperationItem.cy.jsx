/* eslint-disable no-undef */
import AddStackOperationButton from "./AddStackOperationItem";
import { OPERATION_TYPE_STACK } from "../../../../slices/operationsSlice";
import { state } from "./fixtures";

describe("AddStackOperationButton", () => {
  it("should render the button", () => {
    cy.mountWithProviders(<AddStackOperationButton />, {
      preloadedState: { ...state },
    });
    cy.get("button").should("exist");
  });
});
