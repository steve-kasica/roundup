/* eslint-disable no-undef */
import DeleteTablesItem from "./DeleteTablesItem";

describe("DeleteTablesItem", () => {
  it("should render the menu item", () => {
    cy.mountWithProviders(<DeleteTablesItem />);
    cy.get("li").contains("Delete").should("exist");
  });

  describe("when clicked", () => {
    beforeEach(() => {
      cy.mountWithProviders(<DeleteTablesItem />, {
        preloadedState: {
          ui: {
            selectedTableIds: ["t1", "t2"],
          },
        },
      });
      cy.get("li").contains("Delete").click();
    });

    it("should open the confirmation dialog", () => {
      cy.get("[role=dialog]").should("exist");
      cy.get("[role=dialog]")
        .contains("Are you sure you want to delete 2 tables?")
        .should("exist");
    });

    it("should close the dialog on cancel", () => {
      cy.get("[role=dialog]").contains("Cancel").click();
      cy.get("[role=dialog]").should("not.exist");
    });
  });

  describe("when confirmed", () => {
    it("should call onConfirm and close when the user clicks confirm", () => {
      const onConfirmSpy = cy.spy().as("onConfirmSpy");
      cy.mountWithProviders(<DeleteTablesItem onConfirm={onConfirmSpy} />, {
        preloadedState: {
          ui: {
            selectedTableIds: ["t1", "t2"],
          },
        },
      });
      cy.get("li").contains("Delete").click();
      cy.get("[role=dialog]").should("exist");
      cy.get("[role=dialog]").find("button").contains("Delete").click();
      cy.get("[role=dialog]").should("not.exist");
      cy.get("@onConfirmSpy").should("have.been.calledOnce");
      cy.get("@onConfirmSpy").should("have.been.calledWith", ["t1", "t2"]);
    });
  });
});
