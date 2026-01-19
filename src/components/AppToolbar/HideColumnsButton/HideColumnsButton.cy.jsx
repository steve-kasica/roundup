/* eslint-disable no-undef */
import SelectAllColumnsButton from ".";
import { state } from "./fixtures.js";

const hideIconTestId = "VisibilityOffIcon";
const showIconTestId = "VisibilityIcon";

describe("HideColumnsButton Component", () => {
  let localState;
  beforeEach(() => {
    localState = { ...state };
  });

  describe("Basic functionality", () => {
    beforeEach(() => {
      cy.mountWithProviders(<SelectAllColumnsButton />, {
        preloadedState: localState,
      });
    });
    it("renders the button", () => {
      cy.get("button").should("exist");
    });
  });

  describe("Focused object is a table", () => {
    beforeEach(() => {
      localState = {
        ...state,
        ui: {
          ...state.ui,
          focusedObjectId: "t1", // Focus on table
        },
      };
    });

    describe("No table columns are hidden", () => {
      beforeEach(() => {
        localState = {
          ...localState,
          ui: {
            ...localState.ui,
            hiddenColumnIds: [],
          },
        };
      });

      describe("No columns are selected", () => {
        beforeEach(() => {
          localState = {
            ...localState,
            ui: {
              ...localState.ui,
              selectedColumnIds: [],
            },
          };
          cy.mountWithProviders(<SelectAllColumnsButton />, {
            preloadedState: localState,
          });
        });

        it("disables the button", () => {
          cy.get("button").should("be.disabled");
        });
        it("displays the show icon", () => {
          cy.get("button")
            .find("svg")
            .should("have.attr", "data-testid", showIconTestId);
        });
      });
      describe("Some columns are selected", () => {
        beforeEach(() => {
          localState = {
            ...localState,
            ui: {
              ...localState.ui,
              selectedColumnIds: ["c1", "c2"],
            },
          };
          cy.mountWithProviders(<SelectAllColumnsButton />, {
            preloadedState: localState,
          });
        });
        it("enables the button", () => {
          cy.get("button").should("not.be.disabled");
        });
        it("displays the hide icon", () => {
          cy.get("button")
            .find("svg")
            .should("have.attr", "data-testid", hideIconTestId);
        });
        it("adds selected columns to hidden columns on click", () => {
          cy.get("button").click();
          cy.getState().then((state) => {
            const hiddenColumnIds = state.ui.hiddenColumnIds;
            expect(hiddenColumnIds).to.deep.equal(["c1", "c2"]);
          });
        });
      });
    });

    describe("When some table columns are hidden", () => {
      beforeEach(() => {
        localState = {
          ...localState,
          ui: {
            ...localState.ui,
            hiddenColumnIds: ["c3"],
          },
        };
      });
      describe("No columns are selected", () => {
        beforeEach(() => {
          localState = {
            ...localState,
            ui: {
              ...localState.ui,
              selectedColumnIds: [],
            },
          };
          cy.mountWithProviders(<SelectAllColumnsButton />, {
            preloadedState: localState,
          });
        });
        it("displays the show icon", () => {
          cy.get("button")
            .find("svg")
            .should("have.attr", "data-testid", showIconTestId);
        });
        it("remove table columns from hidden columns on click", () => {
          cy.get("button").click();
          cy.getState().then((state) => {
            const hiddenColumnIds = state.ui.hiddenColumnIds;
            expect(hiddenColumnIds).to.deep.equal([]);
          });
        });
      });
      describe("Some columns are selected", () => {
        beforeEach(() => {
          localState = {
            ...localState,
            ui: {
              ...localState.ui,
              selectedColumnIds: ["c1", "c2"],
            },
          };
          cy.mountWithProviders(<SelectAllColumnsButton />, {
            preloadedState: localState,
          });
        });
        it("displays the hide icon", () => {
          cy.get("button")
            .find("svg")
            .should("have.attr", "data-testid", hideIconTestId);
        });
        it("adds selected columns to hidden columns on click", () => {
          cy.get("button").click();
          cy.getState().then((state) => {
            const hiddenColumnIds = state.ui.hiddenColumnIds;
            expect(hiddenColumnIds).to.deep.equal(["c3", "c1", "c2"]);
          });
        });
      });
    });
  });

  //   describe("Focused object is an operation", () => {
  //     describe("No child table columns are hidden", () => {
  //       describe("No columns are selected", () => {});
  //       describe("Some columns are selected", () => {});
  //     });
  //     describe("Some child table columns are hidden", () => {
  //       describe("No columns are selected", () => {});
  //       describe("Some columns are selected", () => {});
  //     });
  //   });
});
