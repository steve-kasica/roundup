/* eslint-disable no-undef */
import InsertColumnItem from "./InsertColumnItem";

describe("InsertColumnItem", () => {
  beforeEach(() => {
    const onSubmit = cy.stub().as("onSubmit");
    const onCancel = cy.stub().as("onCancel");
    cy.mount(
      <InsertColumnItem
        direction="right"
        onSubmit={onSubmit}
        onCancel={onCancel}
      />,
    );
  });

  it("opens the insert dialog when clicked", () => {
    cy.contains("Insert New Column (right)").should("not.exist");
    cy.contains("Insert Column").click();
    cy.contains("Insert New Column (right)").should("exist");
  });

  it("closes the dialog when cancel is clicked", () => {
    cy.contains("Insert Column").click();
    cy.contains("Cancel").click();
    cy.contains("Insert New Column (right)").should("not.exist");
  });

  it("closes the dialog when escape key is pressed", () => {
    cy.contains("Insert Column").click();
    cy.get("body").type("{esc}");
    cy.contains("Insert New Column (right)").should("not.exist");
  });

  it("closes the dialog when confirm is clicked", () => {
    cy.contains("Insert Column").click();
    cy.get("form#insert-column-form").submit();
    cy.contains("Insert New Column (right)").should("not.exist");
  });

  it("calls onCancel when cancel is clicked", () => {
    cy.contains("Insert Column").click();
    cy.contains("Cancel").click();
    cy.get("@onCancel").should("have.been.called");
  });

  it("calls onCancel when escape key is pressed", () => {
    cy.contains("Insert Column").click();
    cy.get("body").type("{esc}");
    cy.get("@onCancel").should("have.been.called");
  });

  it("calls onSubmit when confirm is clicked", () => {
    cy.contains("Insert Column").click();
    cy.get("form#insert-column-form").submit();
    cy.get("@onSubmit").should("have.been.called");
  });
});
