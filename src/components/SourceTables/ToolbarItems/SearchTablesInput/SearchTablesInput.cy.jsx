/* eslint-disable no-undef */
import SearchTablesInput from "./SearchTablesInput";

describe("SearchTablesInput", () => {
  it("should render the search input", () => {
    cy.mountWithProviders(<SearchTablesInput />);
    cy.get('input[placeholder="Search tables..."]').should("exist");
  });

  it("should dispatch setTableSearchString on input change", () => {
    cy.mountWithProviders(<SearchTablesInput />);
    const searchString = "test search";
    cy.get('input[placeholder="Search tables..."]')
      .type(searchString)
      .wait(300) // Wait for debounce
      .then(() => {
        cy.getState().then((state) => {
          expect(state.ui.tableSearchString).to.equal(searchString);
        });
      });
  });
  it("should format the search string by trimming and lowercasing", () => {
    cy.mountWithProviders(<SearchTablesInput />);
    const rawInput = "  TeSt SeArCh  ";
    const formattedInput = "test search";
    cy.get('input[placeholder="Search tables..."]')
      .type(rawInput)
      .wait(300) // Wait for debounce
      .then(() => {
        cy.getState().then((state) => {
          expect(state.ui.tableSearchString).to.equal(formattedInput);
        });
      });
  });
});
